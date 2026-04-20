import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchProperties } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'

const formatEur = (n) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const HomePage = () => {
    const navigate = useNavigate()
    const { user, openAuthModal } = useAuth()
    const { isFavorite, isInCompare, toggleFavorite, toggleCompare, showNotification } = useFavorites()
    const [featured, setFeatured] = useState([])

    useEffect(() => {
        fetchProperties({ sort: 'newest', pageSize: 6 })
            .then(data => setFeatured(data.properties || []))
            .catch(() => {})
    }, [])

    return (
        <>
            <section className="hero">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    className="hero-video"
                >
                    <source src="https://videos.pexels.com/video-files/7577618/7577618-hd_1920_1080_30fps.mp4" type="video/mp4" />
                </video>
                <div className="hero-content">
                    <h1 className="hero-title">Find Your Home in Tirana</h1>
                    <p className="hero-subtitle">
                        Curated apartments and premium properties across Tirana, presented with a cleaner and more refined experience.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                            Explore Properties
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/contact')}>
                            Get in Touch
                        </button>
                    </div>
                </div>
            </section>

            <section className="stats-bar">
                <div className="stat-item">
                    <span className="stat-number">3900+</span>
                    <span className="stat-text">Active Listings</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">100+</span>
                    <span className="stat-text">Tirana Areas</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">AI</span>
                    <span className="stat-text">ML Valuation</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">EUR</span>
                    <span className="stat-text">Prices in EUR</span>
                </div>
            </section>

            <section className="section">
                <h2 className="section-title">Latest Properties</h2>
                <p className="section-subtitle">Recently listed apartments and properties in Tirana</p>

                <div className="featured-container">
                    <div className="property-grid">
                        {featured.map((property) => (
                            <div
                                className="property-card"
                                key={property.id}
                                onClick={() => navigate(`/property/${property.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div
                                    className="property-image"
                                    style={{
                                        backgroundImage: `url(${property.image || property.images?.[0]})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    <div className="card-actions" onClick={e => e.stopPropagation()}>
                                        <button
                                            className={`card-action-btn ${isFavorite(property.id) ? 'favorited' : ''}`}
                                            onClick={() => toggleFavorite(property)}
                                            title={isFavorite(property.id) ? 'Remove' : 'Save'}
                                        >
                                            <i className={isFavorite(property.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                                        </button>
                                        <button
                                            className={`card-action-btn ${isInCompare(property.id) ? 'compared' : ''}`}
                                            onClick={async () => {
                                                const res = await toggleCompare(property)
                                                if (res && res.error) {
                                                    showNotification(res.error, "Comparison Limit")
                                                }
                                            }}
                                            title={isInCompare(property.id) ? 'Remove from compare' : 'Add to compare'}
                                        >
                                            <i className="fa-solid fa-scale-balanced"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="property-info">
                                    <div className="property-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                        <span className="property-tag">{property.tag}</span>
                                    </div>
                                    <div className="property-price" style={{ marginBottom: '0.25rem' }}>{formatEur(property.priceEur)}</div>
                                    <h3 className="property-title">{property.title}</h3>
                                    <p className="property-location">Area {property.neighborhood}</p>
                                    <div className="property-features">
                                        <span className="feature">Rooms {property.rooms}</span>
                                        <span className="feature">Baths {property.bathrooms}</span>
                                        <span className="feature">{property.sqm} m2</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {featured.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => {
                                if (user) {
                                    navigate('/listings')
                                } else {
                                    openAuthModal('Sign in to browse our full inventory of 3,900+ properties.')
                                }
                            }}
                        >
                            View All Properties
                        </button>
                    </div>
                )}
            </section>
        </>
    )
}

export default HomePage
