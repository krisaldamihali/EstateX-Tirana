"""
Flask API for Tirana Real Estate â€“ loads real dataset from
tirana_house_prices.json, provides property listings with ML-based price
estimates (stacked model), comparable properties, and market insights.
"""

from flask import Flask, g, jsonify, request, session
from flask_cors import CORS
import joblib
import numpy as np
import json
import math
import os
import re
import sqlite3
import warnings
from werkzeug.security import check_password_hash, generate_password_hash

warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("APP_SECRET_KEY", "dev-only-change-me")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
            ]
        }
    },
)

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "tirana_real_estate.sqlite3")


def get_db():
    if "db" not in g:
        db = sqlite3.connect(DATABASE_PATH)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        g.db = db
    return g.db


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            is_verified INTEGER NOT NULL DEFAULT 0,
            verification_code TEXT
        );

        CREATE TABLE IF NOT EXISTS user_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            property_id INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, property_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_compare (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            property_id INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, property_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
    )
    user_columns = {
        row["name"] for row in db.execute("PRAGMA table_info(users)").fetchall()
    }
    if "is_verified" not in user_columns:
        # Existing accounts predate email verification, so keep them login-ready.
        db.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 1")
    if "verification_code" not in user_columns:
        db.execute("ALTER TABLE users ADD COLUMN verification_code TEXT")
    db.execute("UPDATE users SET is_verified = 1 WHERE is_verified IS NULL")
    db.commit()


@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None:
        db.close()

# ---------------------------------------------------------------------------
# Load ML model  (stacked: scaler â†’ RF + XGB â†’ Ridge meta-learner)
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "stacked_model.joblib")
stacked_model = None
if os.path.exists(MODEL_PATH):
    stacked_model = joblib.load(MODEL_PATH)
    print(f"[OK] Stacked ML model loaded from {MODEL_PATH}")
else:
    print(f"[WARN] Model not found at {MODEL_PATH}.")

# Tirana city centre (Skanderbeg Square)
TIRANA_CENTER = (41.3275, 19.8189)

# ---------------------------------------------------------------------------
# Load & prepare dataset
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "tirana_house_prices.json")

# Apartment images pool (cycled for listings without images)
IMAGES_POOL = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
]


def _furnishing_label(status):
    if status == "fully_furnished":
        return "Fully Furnished"
    elif status == "partially_furnished":
        return "Partially Furnished"
    return "Unfurnished"


def _extract_area(address):
    """Extract a short area/zone name from the formatted address."""
    if not address:
        return "Tirana"
    # Remove ", Albania" and ", TiranÃ«..." suffixes
    short = re.sub(r",?\s*(TiranÃ«|Tirana|Albania|ShqipÃ«ri).*$", "", address, flags=re.I).strip()
    # Remove "Rruga " prefix for brevity if it makes it too long
    if len(short) > 40:
        short = re.sub(r"^Rruga\s+", "", short)
    return short if short else "Tirana"


def _generate_title(bedrooms, sqm, area):
    """Generate an English title based on property attributes."""
    if bedrooms is None or bedrooms <= 0:
        rooms_text = "Studio"
    elif bedrooms == 1:
        rooms_text = "1-Bedroom Apartment"
    else:
        rooms_text = f"{int(bedrooms)}-Bedroom Apartment"
    sqm_int = int(sqm) if sqm else 0
    return f"{rooms_text} Â· {sqm_int}mÂ² in {area}"


def _generate_features(prop_raw):
    """Build a features list from raw property data."""
    features = []
    if prop_raw.get("main_property_has_elevator") is True:
        features.append("Elevator")
    if prop_raw.get("main_property_has_terrace") is True:
        features.append("Terrace")
    if prop_raw.get("main_property_has_garage") is True:
        features.append("Garage")
    if prop_raw.get("main_property_has_parking_space") is True:
        features.append("Parking")
    if prop_raw.get("main_property_has_garden") is True:
        features.append("Garden")
    if prop_raw.get("main_property_has_carport") is True:
        features.append("Carport")
    bals = prop_raw.get("main_property_property_composition_balconies")
    if bals and bals > 0:
        features.append(f"{int(bals)} Balcon{'y' if bals == 1 else 'ies'}")
    kitch = prop_raw.get("main_property_property_composition_kitchens")
    if kitch and kitch > 0:
        features.append(f"{int(kitch)} Kitchen{'s' if kitch > 1 else ''}")
    livings = prop_raw.get("main_property_property_composition_living_rooms")
    if livings and livings > 0:
        features.append(f"{int(livings)} Living Room{'s' if livings > 1 else ''}")
    furn = prop_raw.get("main_property_furnishing_status")
    if furn and furn != "unfurnished":
        features.append(_furnishing_label(furn))
    return features


def _assign_tag(price, sqm, bedrooms, furnished):
    """Assign a display tag based on property attributes."""
    price_sqm = price / max(sqm, 1) if sqm else 0
    if price_sqm > 2000:
        return "LUXURY"
    if price > 250000:
        return "PREMIUM"
    if furnished == "fully_furnished" and price_sqm > 1500:
        return "FEATURED"
    if bedrooms and bedrooms >= 4:
        return "FAMILY"
    if price < 60000:
        return "BUDGET"
    if price < 90000:
        return "AFFORDABLE"
    return "FOR SALE"


# --- Build PROPERTIES list from raw JSON ---
PROPERTIES = []

if os.path.exists(DATA_PATH):
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
else:
    raw_data = []
    print(f"[WARN] Dataset not found at {DATA_PATH}. Private portfolio data is intentionally excluded.")

for idx, r in enumerate(raw_data):
    price = r.get("price_in_euro")
    sqm = r.get("main_property_property_square")
    bedrooms = r.get("main_property_property_composition_bedrooms")
    bathrooms = r.get("main_property_property_composition_bathrooms")

    # Skip records with missing essential data
    if price is None or sqm is None or bedrooms is None or bathrooms is None:
        continue
    # Remove outliers
    if price < 10000 or price > 1_000_000:
        continue
    if sqm < 20 or sqm > 500:
        continue
    if bedrooms < 0 or bedrooms > 8:
        continue
    if bathrooms < 0:
        continue

    floor = r.get("main_property_floor")
    if floor is None or floor < 0:
        floor = 2.0

    address = r.get("main_property_location_city_zone_formatted_address") or ""
    area = _extract_area(address)

    lat = r.get("main_property_location_lat") or 41.3275
    lng = r.get("main_property_location_lng") or 19.8189

    has_elevator = r.get("main_property_has_elevator") is True
    has_terrace = r.get("main_property_has_terrace") is True
    has_parking = r.get("main_property_has_parking_space") is True
    furn_status = r.get("main_property_furnishing_status") or "unfurnished"
    is_furnished = furn_status in ("fully_furnished", "partially_furnished")
    balconies = r.get("main_property_property_composition_balconies") or 0
    living_rooms = r.get("main_property_property_composition_living_rooms") or 0
    total_rooms = int(bedrooms) + int(living_rooms)

    # Assign images from pool based on index
    img_idx = idx % len(IMAGES_POOL)
    images = [
        IMAGES_POOL[(img_idx + j) % len(IMAGES_POOL)]
        for j in range(4)
    ]

    tag = _assign_tag(price, sqm, bedrooms, furn_status)

    prop = {
        "id": idx + 1,
        "title": _generate_title(bedrooms, sqm, area),
        "neighborhood": area,
        "address": address or f"{area}, Tirana, Albania",
        "priceEur": round(price),
        "sqm": round(sqm, 1),
        "rooms": int(bedrooms),
        "bathrooms": int(bathrooms),
        "floor": int(floor),
        "totalFloors": max(int(floor) + 2, 5),
        "hasElevator": has_elevator,
        "hasTerrace": has_terrace,
        "hasParking": has_parking,
        "isFurnished": is_furnished,
        "totalRooms": total_rooms,
        "furnishingStatus": _furnishing_label(furn_status),
        "balconies": int(balconies),
        "lat": float(lat),
        "lng": float(lng),
        "description": r.get("main_property_description_text_content_original_text", ""),
        "images": images,
        "image": images[0],
        "features": _generate_features(r),
        "tag": tag,
    }
    PROPERTIES.append(prop)

print(f"[OK] Loaded {len(PROPERTIES)} properties from dataset")
PROPERTY_INDEX = {p["id"]: p for p in PROPERTIES}

# Build unique area list for neighborhoods endpoint
AREA_SET = sorted(set(p["neighborhood"] for p in PROPERTIES))

# ---------------------------------------------------------------------------
# Haversine helper + KMeans clustering + stacked-model prediction
# ---------------------------------------------------------------------------
from sklearn.cluster import KMeans


def _haversine_km(lat1, lng1, lat2, lng2):
    """Great-circle distance between two points in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# Compute neighbourhood clusters (k=3) and per-property derived fields.
# The public portfolio copy intentionally excludes the private dataset, so
# keep the API importable even when PROPERTIES is empty.
if PROPERTIES:
    _coords = np.array([[p["lat"], p["lng"]] for p in PROPERTIES])
    _kmeans = KMeans(n_clusters=min(3, len(PROPERTIES)), random_state=42, n_init=10).fit(_coords)
    _cluster_centers = _kmeans.cluster_centers_

    for i, p in enumerate(PROPERTIES):
        cluster_label = int(_kmeans.labels_[i])
        dist_center = _haversine_km(p["lat"], p["lng"], TIRANA_CENTER[0], TIRANA_CENTER[1])
        dists_to_cc = [
            _haversine_km(p["lat"], p["lng"], cc[0], cc[1])
            for cc in _cluster_centers
        ]
        dist_nearest_cc = min(dists_to_cc)
        p["neighborhoodCluster"] = cluster_label
        p["distFromCenter"] = round(dist_center, 4)
        p["distToNearestCenter"] = round(dist_nearest_cc, 4)

    print(f"[OK] Computed neighbourhood clusters and distances for {len(PROPERTIES)} properties")
else:
    _cluster_centers = np.array([TIRANA_CENTER])
    print("[WARN] No private dataset found; public API starts with zero listings.")

# Pre-compute neighbourhood statistics (fallback when model unavailable)
_AREA_STATS = {}
for _area in AREA_SET:
    _area_props = [p for p in PROPERTIES if p["neighborhood"] == _area]
    if not _area_props:
        continue
    _prices_per_sqm = sorted([p["priceEur"] / max(p["sqm"], 1) for p in _area_props])
    _n = len(_prices_per_sqm)
    _AREA_STATS[_area] = {
        "median": _prices_per_sqm[_n // 2],
        "avg": sum(_prices_per_sqm) / _n,
        "p25": _prices_per_sqm[int(_n * 0.25)],
        "p75": _prices_per_sqm[int(_n * 0.75)],
        "count": _n,
    }

print(f"[OK] Computed area statistics for {len(_AREA_STATS)} neighborhoods")


import threading
_predict_lock = threading.Lock()

def predict_price(prop):
    """Return dict with estimated, low, high (EUR) and valuation label.

    Uses the stacked model pipeline:
        scaler â†’ RF + XGB â†’ Ridge meta-learner
    10 features: area_sqm, floor, bedrooms, bathrooms, has_elevator,
                 has_parking_space, distance_from_center, total_rooms,
                 neighborhood_cluster, dist_to_nearest_center
    Falls back to neighbourhood-median approach if model is not loaded.
    """
    sqm = prop.get("sqm", 80)

    if stacked_model is not None:
        scaler = stacked_model["scaler"]
        rf     = stacked_model["rf"]
        xgb    = stacked_model["xgb"]
        meta   = stacked_model["meta"]

        features = np.array([[
            sqm,                                            # area_sqm
            prop.get("floor", 2),                           # floor
            prop.get("rooms", 2),                           # bedrooms
            prop.get("bathrooms", 1),                       # bathrooms
            1 if prop.get("hasElevator") else 0,            # has_elevator
            1 if prop.get("hasParking") else 0,             # has_parking_space
            prop.get("distFromCenter", 2.5),                # distance_from_center
            prop.get("totalRooms", prop.get("rooms", 2)),   # total_rooms
            prop.get("neighborhoodCluster", 1),             # neighborhood_cluster
            prop.get("distToNearestCenter", 0.1),           # dist_to_nearest_center
        ]])

        with _predict_lock:
            X_scaled = scaler.transform(features)
            rf_pred  = rf.predict(X_scaled)
            xgb_pred = xgb.predict(X_scaled)
            predicted = float(meta.predict(np.column_stack([rf_pred, xgb_pred]))[0])
            predicted = max(predicted, 5000)

        margin = predicted * 0.12
        estimated = round(predicted, -2)
        low = round(predicted - margin, -2)
        high = round(predicted + margin, -2)
        method = "ml"
    else:
        # Fallback: neighbourhood median â‚¬/mÂ²
        area = prop.get("neighborhood", "Tirana")
        stats = _AREA_STATS.get(area)
        if stats:
            estimated = round(stats["median"] * sqm, -2)
            low = round(stats["p25"] * sqm, -2)
            high = round(stats["p75"] * sqm, -2)
        else:
            all_ppsqm = sorted([p["priceEur"] / max(p["sqm"], 1) for p in PROPERTIES])
            estimated = round(all_ppsqm[len(all_ppsqm) // 2] * sqm, -2)
            low = round(all_ppsqm[int(len(all_ppsqm) * 0.25)] * sqm, -2)
            high = round(all_ppsqm[int(len(all_ppsqm) * 0.75)] * sqm, -2)
        estimated = max(estimated, 5000)
        low = max(low, 5000)
        high = max(high, low + 1000)
        method = "comps"

    actual = prop.get("priceEur", 0)
    if actual > high:
        label = "Overpriced"
    elif actual < low:
        label = "Underpriced"
    else:
        label = "Fair"

    diff_pct = round((actual - estimated) / estimated * 100, 1) if estimated else 0

    return {
        "estimated": estimated,
        "low": low,
        "high": high,
        "label": label,
        "diffPercent": diff_pct,
        "pricePerSqm": round(estimated / sqm) if sqm else 0,
        "method": method,
    }


def find_comps(property_id, limit=5):
    """Find comparable properties with English similarity reasons."""
    target = next((p for p in PROPERTIES if p["id"] == property_id), None)
    if not target:
        return []

    scored = []
    for p in PROPERTIES:
        if p["id"] == property_id:
            continue

        reasons = []
        score = 0

        # Distance
        dist = _haversine_km(target["lat"], target["lng"], p["lat"], p["lng"])
        if dist < 0.01:
            # Same building â€” slight penalty to encourage diversity
            score += 0.5
            reasons.append("Same building")
        elif dist < 0.3:
            score += dist * 3
            reasons.append(f"Only {max(int(dist*1000), 1)}m away")
        elif dist < 2.0:
            score += dist * 3
            reasons.append(f"{dist:.1f}km away")
        else:
            score += dist * 3

        # Same area
        if p["neighborhood"] == target["neighborhood"]:
            score -= 1.5
            reasons.append("Same area")

        # Size similarity
        sqm_diff = abs(p["sqm"] - target["sqm"])
        sqm_pct = sqm_diff / max(target["sqm"], 1)
        score += sqm_pct * 2
        if sqm_pct < 0.15:
            reasons.append(f"Similar size ({p['sqm']}mÂ²)")

        # Room similarity
        room_diff = abs(p["rooms"] - target["rooms"])
        score += room_diff * 0.8
        if room_diff == 0:
            reasons.append(f"Same bedrooms ({p['rooms']})")

        # Bathroom similarity
        bath_diff = abs(p["bathrooms"] - target["bathrooms"])
        score += bath_diff * 0.5
        if bath_diff == 0 and p["bathrooms"] > 1:
            reasons.append(f"{p['bathrooms']} baths alike")

        # Floor similarity
        floor_diff = abs(p["floor"] - target["floor"])
        score += floor_diff * 0.2

        # Feature matches
        if p["hasElevator"] == target["hasElevator"]:
            pass  # common, don't reward
        if p["hasTerrace"] == target["hasTerrace"] and target["hasTerrace"]:
            reasons.append("Both have terrace")
            score -= 0.3
        if p["isFurnished"] == target["isFurnished"] and target["isFurnished"]:
            reasons.append("Both furnished")
            score -= 0.3

        # Price similarity
        price_diff = abs(p["priceEur"] - target["priceEur"]) / max(target["priceEur"], 1)
        score += price_diff * 1.5
        if price_diff < 0.15:
            reasons.append("Similar price")

        if not reasons:
            reasons.append(f"{dist:.1f}km, {p['sqm']}mÂ²")

        reasons = reasons[:3]
        scored.append((score, p, reasons))

    scored.sort(key=lambda x: x[0])
    results = []
    same_building_count = 0
    for _, p, reasons in scored:
        if len(results) >= limit:
            break
        # Limit same-building comps to at most 2 for diversity
        is_same_building = "Same building" in reasons
        if is_same_building:
            if same_building_count >= 2:
                continue
            same_building_count += 1
        comp = dict(p)
        comp["similarityReasons"] = reasons
        comp["marketEstimate"] = predict_price(p)
        results.append(comp)
    return results


# ---------------------------------------------------------------------------
# Pagination helper
# ---------------------------------------------------------------------------
DEFAULT_PAGE_SIZE = 30


# ---------------------------------------------------------------------------
# SQLite-backed auth and user lists
# ---------------------------------------------------------------------------
def serialize_user(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
    }


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    row = get_db().execute(
        "SELECT id, name, email FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()

    if not row:
        session.pop("user_id", None)
        return None

    return row


def property_exists(property_id):
    return property_id in PROPERTY_INDEX


def hydrate_property_list(property_ids):
    hydrated = []
    for property_id in property_ids:
        prop = PROPERTY_INDEX.get(property_id)
        if not prop:
            continue
        hydrated.append(dict(prop))
    return hydrated


def get_user_favorites(user_id):
    rows = get_db().execute(
        "SELECT property_id FROM user_favorites WHERE user_id = ? ORDER BY id DESC",
        (user_id,),
    ).fetchall()
    return hydrate_property_list([row["property_id"] for row in rows])


def get_user_compare(user_id):
    rows = get_db().execute(
        "SELECT property_id FROM user_compare WHERE user_id = ? ORDER BY id ASC",
        (user_id,),
    ).fetchall()
    return hydrate_property_list([row["property_id"] for row in rows])


def require_authenticated_user():
    user = get_current_user()
    if not user:
        return None, (jsonify({"error": "Please sign in to continue."}), 401)
    return user, None


with app.app_context():
    init_db()


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------
@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    return jsonify({"user": serialize_user(get_current_user())})


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Strict Email Regex
    import re
    if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", email):
        return jsonify({"error": "Invalid email formatting"}), 400

    # Password complexity: 8+ chars, uppercase, symbol
    if (len(password) < 8 or 
        not re.search(r"[A-Z]", password) or 
        not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)):
        return jsonify({"error": "Password does not meet complexity requirements"}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"error": "Email is already registered"}), 409

    # Generate a random 6-digit verification code
    import random
    code = f"{random.randint(100000, 999999)}"
    
    # In a real app, you'd send this via email.
    # For this demo, we print it to console.
    print(f"\n[VERIFICATION] Email: {email} | Code: {code}\n")

    db.execute(
        "INSERT INTO users (name, email, password_hash, verification_code, is_verified) VALUES (?, ?, ?, ?, 0)",
        (name, email, generate_password_hash(password), code),
    )
    db.commit()

    return jsonify({"message": "Verification code sent to your email", "email": email}), 201


@app.route("/api/auth/verify", methods=["POST"])
def auth_verify():
    data = request.json
    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()

    if not email or not code:
        return jsonify({"error": "Missing email or code"}), 400

    db = get_db()
    user = db.execute(
        "SELECT id, name FROM users WHERE email = ? AND verification_code = ?",
        (email, code),
    ).fetchone()

    if not user:
        return jsonify({"error": "Invalid verification code"}), 400

    db.execute("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", (user["id"],))
    db.commit()

    session["user_id"] = user["id"]
    return jsonify({
        "message": "Email verified successfully",
        "user": {"id": user["id"], "name": user["name"], "email": email}
    }), 200


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    db = get_db()
    user = db.execute(
        "SELECT id, name, password_hash, is_verified FROM users WHERE email = ?", (email,)
    ).fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user["is_verified"]:
        return jsonify({"error": "Email not verified", "requires_verification": True, "email": email}), 403

    session["user_id"] = user["id"]
    return jsonify({
        "message": "Login successful",
        "user": {"id": user["id"], "name": user["name"], "email": email}
    }), 200


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"success": True})


@app.route("/api/contact", methods=["POST"])
def contact_form():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    subject = (data.get("subject") or "").strip()
    message = (data.get("message") or "").strip()
    property_id = data.get("propertyId")

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are required."}), 400

    if "@" not in email:
        return jsonify({"error": "Invalid email address."}), 400

    # In a real environment, send email or store in DB.
    # For now, we simulate success.
    print(f"[CONTACT-FORM] From: {name} ({email}), Subject: {subject}, Msg: {message}, PropId: {property_id}")
    
    return jsonify({
        "success": True, 
        "message": "Thank you! Your message has been sent successfully. One of our advisors will contact you soon."
    })


@app.route("/api/account/preferences", methods=["GET"])
def get_account_preferences():
    user, error = require_authenticated_user()
    if error:
        return error

    return jsonify({
        "favorites": get_user_favorites(user["id"]),
        "compareList": get_user_compare(user["id"]),
    })


@app.route("/api/account/favorites/toggle", methods=["POST"])
def toggle_account_favorite():
    user, error = require_authenticated_user()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    property_id = data.get("propertyId")
    if not isinstance(property_id, int) or not property_exists(property_id):
        return jsonify({"error": "Property not found."}), 404

    db = get_db()
    existing = db.execute(
        "SELECT id FROM user_favorites WHERE user_id = ? AND property_id = ?",
        (user["id"], property_id),
    ).fetchone()

    saved = False
    if existing:
        db.execute(
            "DELETE FROM user_favorites WHERE user_id = ? AND property_id = ?",
            (user["id"], property_id),
        )
    else:
        db.execute(
            "INSERT INTO user_favorites (user_id, property_id) VALUES (?, ?)",
            (user["id"], property_id),
        )
        saved = True

    db.commit()
    return jsonify({
        "saved": saved,
        "favorites": get_user_favorites(user["id"]),
    })


@app.route("/api/account/compare/toggle", methods=["POST"])
def toggle_account_compare():
    user, error = require_authenticated_user()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    property_id = data.get("propertyId")
    if not isinstance(property_id, int) or not property_exists(property_id):
        return jsonify({"error": "Property not found."}), 404

    db = get_db()
    existing = db.execute(
        "SELECT id FROM user_compare WHERE user_id = ? AND property_id = ?",
        (user["id"], property_id),
    ).fetchone()

    added = False
    if existing:
        db.execute(
            "DELETE FROM user_compare WHERE user_id = ? AND property_id = ?",
            (user["id"], property_id),
        )
    else:
        current_total = db.execute(
            "SELECT COUNT(*) AS total FROM user_compare WHERE user_id = ?",
            (user["id"],),
        ).fetchone()["total"]
        if current_total >= 4:
            return jsonify({"error": "You can compare up to 4 properties at a time."}), 400

        db.execute(
            "INSERT INTO user_compare (user_id, property_id) VALUES (?, ?)",
            (user["id"], property_id),
        )
        added = True

    db.commit()
    return jsonify({
        "added": added,
        "compareList": get_user_compare(user["id"]),
    })


@app.route("/api/account/compare", methods=["DELETE"])
def clear_account_compare():
    user, error = require_authenticated_user()
    if error:
        return error

    db = get_db()
    db.execute("DELETE FROM user_compare WHERE user_id = ?", (user["id"],))
    db.commit()
    return jsonify({"compareList": []})


@app.route("/api/properties", methods=["GET"])
def get_properties():
    """
    Return property listings with filters and pagination.
    Query params: search, neighborhood, minPrice, maxPrice, minSqm, maxSqm,
                  rooms, bathrooms, furnished, elevator, terrace, tag, sort,
                  page, pageSize
    """
    results = list(PROPERTIES)

    search = request.args.get("search", "").strip().lower()
    neighborhood = request.args.get("neighborhood", "").strip()
    min_price = request.args.get("minPrice", type=int)
    max_price = request.args.get("maxPrice", type=int)
    min_sqm = request.args.get("minSqm", type=int)
    max_sqm = request.args.get("maxSqm", type=int)
    rooms = request.args.get("rooms", type=int)
    bathrooms = request.args.get("bathrooms", type=int)
    furnished = request.args.get("furnished", "").strip().lower()
    elevator = request.args.get("elevator", "").strip().lower()
    terrace = request.args.get("terrace", "").strip().lower()
    tag = request.args.get("tag", "").strip()

    if search:
        results = [
            p for p in results
            if (search in p["title"].lower()
                or search in p["neighborhood"].lower()
                or search in p["address"].lower())
        ]
    if neighborhood:
        results = [p for p in results if p["neighborhood"] == neighborhood]
    if min_price is not None:
        results = [p for p in results if p["priceEur"] >= min_price]
    if max_price is not None:
        results = [p for p in results if p["priceEur"] <= max_price]
    if min_sqm is not None:
        results = [p for p in results if p["sqm"] >= min_sqm]
    if max_sqm is not None:
        results = [p for p in results if p["sqm"] <= max_sqm]
    if rooms is not None:
        results = [p for p in results if p["rooms"] >= rooms]
    if bathrooms is not None:
        results = [p for p in results if p["bathrooms"] >= bathrooms]
    if furnished == "true":
        results = [p for p in results if p["isFurnished"]]
    elif furnished == "false":
        results = [p for p in results if not p["isFurnished"]]
    if elevator == "true":
        results = [p for p in results if p["hasElevator"]]
    if terrace == "true":
        results = [p for p in results if p["hasTerrace"]]
    if tag:
        results = [p for p in results if p.get("tag", "") == tag]

    # Sorting
    sort_by = request.args.get("sort", "").strip()
    if sort_by == "price_asc":
        results.sort(key=lambda p: p["priceEur"])
    elif sort_by == "price_desc":
        results.sort(key=lambda p: p["priceEur"], reverse=True)
    elif sort_by == "sqm_desc":
        results.sort(key=lambda p: p["sqm"], reverse=True)
    elif sort_by == "sqm_asc":
        results.sort(key=lambda p: p["sqm"])
    elif sort_by == "price_sqm":
        results.sort(key=lambda p: p["priceEur"] / max(p["sqm"], 1))
    else:
        # Default: newest first (by id descending)
        results.sort(key=lambda p: p["id"], reverse=True)

    total = len(results)

    # Pagination
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("pageSize", DEFAULT_PAGE_SIZE, type=int)
    page_size = min(page_size, 100)
    start = (page - 1) * page_size
    end = start + page_size
    page_results = results[start:end]

    # Enrich with ML-based estimate
    enriched = []
    for p in page_results:
        item = dict(p)
        item["marketEstimate"] = predict_price(p)
        enriched.append(item)

    return jsonify({
        "properties": enriched,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": math.ceil(total / page_size) if page_size else 1,
    })


@app.route("/api/properties/<int:property_id>", methods=["GET"])
def get_property(property_id):
    """Return a single property with market estimate, comps, and market insights."""
    prop = next((p for p in PROPERTIES if p["id"] == property_id), None)
    if not prop:
        return jsonify({"error": "Property not found"}), 404

    result = dict(prop)

    result["marketEstimate"] = predict_price(prop)

    result["comparables"] = find_comps(property_id, limit=5)

    # Market insight for same area
    area = prop["neighborhood"]
    area_props = [p for p in PROPERTIES if p["neighborhood"] == area]
    if area_props:
        prices_sqm = [p["priceEur"] / max(p["sqm"], 1) for p in area_props]
        result["marketInsight"] = {
            "neighborhood": area,
            "avgPricePerSqm": round(sum(prices_sqm) / len(prices_sqm)),
            "minPricePerSqm": round(min(prices_sqm)),
            "maxPricePerSqm": round(max(prices_sqm)),
            "totalListings": len(area_props),
            "avgPrice": round(sum(p["priceEur"] for p in area_props) / len(area_props)),
            "avgSqm": round(sum(p["sqm"] for p in area_props) / len(area_props)),
        }

    return jsonify(result)


@app.route("/api/estimate", methods=["POST"])
def estimate_price():
    """Accept JSON body with property features, return ML price estimate."""
    data = request.get_json(force=True)
    lat = data.get("lat", 41.3275)
    lng = data.get("lng", 19.8189)
    rooms = data.get("rooms", 2)
    dist_center = _haversine_km(lat, lng, TIRANA_CENTER[0], TIRANA_CENTER[1])
    dists_cc = [_haversine_km(lat, lng, cc[0], cc[1]) for cc in _cluster_centers]
    dist_nearest = min(dists_cc)
    cluster = int(np.argmin(dists_cc))
    prop_data = {
        "sqm": data.get("sqm", 80),
        "rooms": rooms,
        "bathrooms": data.get("bathrooms", 1),
        "floor": data.get("floor", 3),
        "hasElevator": data.get("hasElevator", True),
        "hasParking": data.get("hasParking", False),
        "totalRooms": data.get("totalRooms", rooms),
        "distFromCenter": dist_center,
        "neighborhoodCluster": cluster,
        "distToNearestCenter": dist_nearest,
        "priceEur": data.get("priceEur", 0),
        "neighborhood": data.get("neighborhood", "Tirana"),
    }
    return jsonify(predict_price(prop_data))


@app.route("/api/neighborhoods", methods=["GET"])
def get_neighborhoods():
    """Return list of areas/zones with stats."""
    stats = []
    for area in AREA_SET:
        area_props = [p for p in PROPERTIES if p["neighborhood"] == area]
        if area_props:
            prices_sqm = [p["priceEur"] / max(p["sqm"], 1) for p in area_props]
            avg_lat = sum(p["lat"] for p in area_props) / len(area_props)
            avg_lng = sum(p["lng"] for p in area_props) / len(area_props)
            stats.append({
                "name": area,
                "listings": len(area_props),
                "avgPricePerSqm": round(sum(prices_sqm) / len(prices_sqm)),
                "avgPrice": round(sum(p["priceEur"] for p in area_props) / len(area_props)),
                "coords": (avg_lat, avg_lng),
            })
    # Sort by number of listings descending
    stats.sort(key=lambda x: x["listings"], reverse=True)
    return jsonify(stats)


@app.route("/api/map-points", methods=["GET"])
def get_map_points():
    """Return lightweight list of ALL property locations for the map.
    Only sends the fields needed for map markers + popups to keep the
    payload small (no descriptions, images, or ML predictions)."""
    points = []
    for p in PROPERTIES:
        if not p["lat"] or not p["lng"]:
            continue
        desc = p.get("description", "")
        short_desc = (desc[:150] + "â€¦") if len(desc) > 150 else desc
        points.append({
            "id": p["id"],
            "lat": p["lat"],
            "lng": p["lng"],
            "title": p["title"],
            "neighborhood": p["neighborhood"],
            "priceEur": p["priceEur"],
            "sqm": p["sqm"],
            "rooms": p["rooms"],
            "bathrooms": p["bathrooms"],
            "tag": p.get("tag", ""),
            "description": short_desc,
        })
    return jsonify(points)


@app.route("/api/market-insights", methods=["GET"])
def market_insights():
    """Return overall market insights for Tirana."""
    all_prices = [p["priceEur"] for p in PROPERTIES]
    all_sqm = [p["sqm"] for p in PROPERTIES]
    all_price_sqm = [p["priceEur"] / max(p["sqm"], 1) for p in PROPERTIES]

    by_area = {}
    for p in PROPERTIES:
        area = p["neighborhood"]
        if area not in by_area:
            by_area[area] = {"prices": [], "sqms": []}
        by_area[area]["prices"].append(p["priceEur"])
        by_area[area]["sqms"].append(p["sqm"])

    area_stats = []
    for area, data in sorted(by_area.items()):
        avg_p = sum(data["prices"]) / len(data["prices"])
        avg_s = sum(data["sqms"]) / len(data["sqms"])
        area_stats.append({
            "neighborhood": area,
            "avgPrice": round(avg_p),
            "avgSqm": round(avg_s),
            "avgPricePerSqm": round(avg_p / avg_s) if avg_s else 0,
            "listings": len(data["prices"]),
        })
    area_stats.sort(key=lambda x: x["avgPricePerSqm"], reverse=True)

    return jsonify({
        "totalListings": len(PROPERTIES),
        "avgPrice": round(sum(all_prices) / len(all_prices)),
        "medianPrice": round(sorted(all_prices)[len(all_prices) // 2]),
        "avgSqm": round(sum(all_sqm) / len(all_sqm)),
        "avgPricePerSqm": round(sum(all_price_sqm) / len(all_price_sqm)),
        "priceRange": {"min": min(all_prices), "max": max(all_prices)},
        "neighborhoods": area_stats,
    })


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=False, port=5000, threaded=False)

