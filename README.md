# EstateX-Tirana

EstateX Tirana is a full-stack real estate portfolio project for browsing, filtering, comparing, and valuing apartment listings in Tirana, Albania.

This public repository contains the application source code that is safe to show in a portfolio. Private assets are intentionally excluded.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, React Router |
| Backend | Flask 3, Python |
| Storage | Local SQLite for demo user accounts |
| ML Integration | Private trained model loaded locally when available |
| Maps | OpenStreetMap tiles |

## Public Repository Contents.

```text
EstateX-Tirana/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── README.md
├── public/
├── src/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── LICENSE
├── NOTICE.md
└── README.md
```

## Private Assets Not Included

The following files and folders are excluded from this public portfolio copy:

- `models/` and trained model files such as `*.joblib`, `*.pkl`, `*.onnx`, `*.pt`, `*.pth`
- `tirana_house_prices.json` and any raw/scraped datasets
- `backend/*.sqlite3` and other local database files
- `.env` files, local secrets, tokens, and API keys
- `node_modules/`, `venv/`, `dist/`, cache folders, and generated artifacts

The backend is adjusted so it can still import and start without the private dataset/model. Listing endpoints will return empty demo data unless private assets are restored locally by the owner.

## Run Frontend

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:3000` and proxies `/api/*` requests to Flask on `http://127.0.0.1:5000`.

## Run Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
$env:APP_SECRET_KEY="replace-with-a-local-dev-secret"
python backend/app.py
```

On macOS/Linux, use `source .venv/bin/activate` and `export APP_SECRET_KEY="replace-with-a-local-dev-secret"`.

## Features

- Property listing UI with filters, sorting, favorites, compare, and detail pages
- Authentication and protected flows for account-based actions
- Contact and valuation request flows
- Map-based property exploration
- Backend endpoints for listings, market insights, favorites, compare, auth, and valuation
- Private ML model integration point for price estimates

## License

This code is shared for portfolio review only. All rights are reserved. You may not copy, modify, distribute, deploy, sell, sublicense, or reuse this code without prior written permission from the copyright holder.
