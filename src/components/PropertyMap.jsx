import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMapPoints } from '../services/api'
import { useAuth } from '../context/AuthContext'

const formatEur = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

/**
 * Full-dataset property map.
 * Fetches ALL property locations from /api/map-points and renders them
 * with Leaflet MarkerCluster. Clicking a marker navigates to property detail.
 */
const PropertyMap = () => {
    const { user, openAuthModal } = useAuth()
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const clusterRef = useRef(null)
    const navigate = useNavigate()
    const [pointCount, setPointCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return // Don't fetch or init map if no user

        const L = window.L
        if (!L || !mapRef.current) return

        // Create map once
        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [41.3275, 19.8187],
                zoom: 13,
                zoomControl: true,
            })

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19
            }).addTo(map)

            mapInstanceRef.current = map
        }

        const map = mapInstanceRef.current

        // Fetch all points and add markers
        setLoading(true)
        fetchMapPoints()
            .then((points) => {
                // Remove old cluster layer if re-fetching
                if (clusterRef.current) {
                    map.removeLayer(clusterRef.current)
                }

                const cluster = L.markerClusterGroup({
                    maxClusterRadius: 50,
                    spiderfyOnMaxZoom: true,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: true,
                    disableClusteringAtZoom: 17,
                    chunkedLoading: true,
                })

                const goldIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })

                points.forEach((p) => {
                    if (!p.lat || !p.lng) return

                    const marker = L.marker([p.lat, p.lng], { icon: goldIcon })

                    const descHtml = p.description
                        ? `<p style="margin:6px 0 0;color:#555;font-size:0.82rem;line-height:1.4;border-top:1px solid #eee;padding-top:6px;">${p.description}</p>`
                        : ''

                    const popup = `
                        <div style="font-family:'Outfit',sans-serif;min-width:220px;max-width:300px;padding:8px;">
                            <h3 style="margin:0 0 6px;color:#1a1a1a;font-size:1rem;font-weight:600;line-height:1.3;">
                                ${p.title}
                            </h3>
                            <p style="margin:0 0 6px;color:#d4a574;font-weight:700;font-size:1.15rem;font-family:'Playfair Display',serif;">
                                ${formatEur(p.priceEur)}
                            </p>
                            <p style="margin:0 0 6px;color:#666;font-size:0.88rem;">
                                📍 ${p.neighborhood}
                            </p>
                            <div style="display:flex;gap:12px;padding-top:6px;border-top:1px solid #eee;">
                                <span style="color:#666;font-size:0.85rem;">🛏️ ${p.rooms}</span>
                                <span style="color:#666;font-size:0.85rem;">🚿 ${p.bathrooms}</span>
                                <span style="color:#666;font-size:0.85rem;">📐 ${p.sqm}m²</span>
                            </div>
                            ${p.tag ? `<span style="display:inline-block;margin-top:6px;background:#1a1a1a;color:white;padding:3px 8px;border-radius:4px;font-size:0.72rem;font-weight:500;">${p.tag}</span>` : ''}
                            ${descHtml}
                            <button
                                onclick="window.__navigateToProperty(${p.id})"
                                style="width:100%;margin-top:10px;padding:9px;background:#d4a574;color:white;border:none;border-radius:4px;font-weight:600;cursor:pointer;font-size:0.88rem;"
                                onmouseover="this.style.background='#8b7355'"
                                onmouseout="this.style.background='#d4a574'"
                            >View Details →</button>
                        </div>
                    `

                    marker.bindPopup(popup, { maxWidth: 300, className: 'custom-popup' })
                    cluster.addLayer(marker)
                })

                map.addLayer(cluster)
                clusterRef.current = cluster
                setPointCount(points.length)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Failed to load map points:', err)
                setLoading(false)
            })

        // Expose navigate function for popup button clicks
        window.__navigateToProperty = (id) => navigate(`/property/${id}`)

        return () => {
            delete window.__navigateToProperty
            if (clusterRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(clusterRef.current)
                clusterRef.current = null
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [navigate, user])

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {!user && (
                <div className="map-auth-overlay">
                    <div className="map-auth-content">
                        <div className="map-auth-icon">📍</div>
                        <h3>Interactive Map</h3>
                        <p>Sign in to view all properties across Tirana on our interactive map.</p>
                        <button className="btn btn-primary" onClick={() => openAuthModal()}>
                            Sign In to View Map
                        </button>
                    </div>
                </div>
            )}
            
            {/* Point counter badge */}
            {user && (
                <div className="map-point-counter">
                    {loading ? 'Loading…' : `${pointCount.toLocaleString()} properties`}
                </div>
            )}
            
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    filter: user ? 'none' : 'blur(4px) grayscale(1)',
                    opacity: user ? 1 : 0.6,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                }}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .map-auth-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(8px);
                    border-radius: 8px;
                }
                .map-auth-content {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 16px;
                    text-align: center;
                    max-width: 320px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(212, 165, 116, 0.2);
                }
                .map-auth-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }
                .map-auth-content h3 {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: var(--primary);
                }
                .map-auth-content p {
                    font-size: 0.95rem;
                    color: var(--text-light);
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
            `}} />
        </div>
    )
}

export default PropertyMap