import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PriceEstimate from '../components/PriceEstimate'
import ComparableProperties from '../components/ComparableProperties'
import MarketInsights from '../components/MarketInsights'
import { fetchProperty } from '../services/api'
import { useFavorites } from '../context/FavoritesContext'

const formatEur = (n) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const PropertyDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { 
        isFavorite, 
        toggleFavorite, 
        isInCompare, 
        toggleCompare,
        showNotification 
    } = useFavorites()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [property, setProperty] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        setLoading(true)
        setError(null)
        setCurrentImageIndex(0)
        fetchProperty(id)
            .then(data => setProperty(data))
            .catch(() => setError('Failed to load property'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <>
                <div style={{ height: '85px' }}></div>
                <div className="listings-loading" style={{ minHeight: '60vh' }}>
                    <div className="loading-spinner" />
                    <p>Loading property...</p>
                </div>
            </>
        )
    }

    if (error || !property) {
        return (
            <div style={{ padding: '10rem 2rem', textAlign: 'center' }}>
                <h2>Property Not Found</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
                <button onClick={() => navigate('/listings')} className="btn btn-primary">
                    Back to Listings
                </button>
            </div>
        )
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => prev === property.images.length - 1 ? 0 : prev + 1)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => prev === 0 ? property.images.length - 1 : prev - 1)
    }

    const pricePerSqm = property.sqm ? Math.round(property.priceEur / property.sqm) : 0

    return (
        <>
            <div style={{ height: '85px' }}></div>

            <section className="section detail-page" style={{ paddingTop: '2rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <button onClick={() => navigate('/listings')} className="back-btn">
                        Back to Listings
                    </button>

                    <div className="detail-gallery">
                        <div
                            className="detail-gallery-img"
                            style={{ backgroundImage: `url(${property.images[currentImageIndex]})` }}
                        ></div>


                        <div className="detail-gallery-actions">
                            <button 
                                className={`gallery-action-btn ${isFavorite(property.id) ? 'favorited' : ''}`} 
                                onClick={() => toggleFavorite(property)}
                                title={isFavorite(property.id) ? 'Remove' : 'Save'}
                            >
                                <i className={isFavorite(property.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                            </button>
                            <button 
                                className={`gallery-action-btn ${isInCompare(property.id) ? 'compared' : ''}`} 
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

                        <button onClick={prevImage} className="carousel-btn prev">&lt;</button>
                        <button onClick={nextImage} className="carousel-btn next">&gt;</button>

                        <div className="carousel-counter">
                            {currentImageIndex + 1} / {property.images.length}
                        </div>

                        <div className="carousel-dots">
                            {property.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="detail-layout">
                        <div>
                            <div className="property-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                <span className="property-tag">{property.tag}</span>
                            </div>
                            <div className="detail-header-row">
                                <div>
                                    <h1 className="detail-title">{property.title}</h1>
                                    <p className="detail-address">Address {property.address}</p>
                                </div>
                                <div className="detail-header-price">
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="detail-header-price-value">{formatEur(property.priceEur)}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                                            <span className="detail-header-price-sqm">{formatEur(pricePerSqm)}/m2</span>
                                            {property.marketEstimate && (
                                                <span className="card-valuation-label" style={{ 
                                                    background: (property.marketEstimate.label === 'Overpriced' ? 'rgba(171, 88, 74, 0.15)' : 'rgba(58, 117, 150, 0.15)'), 
                                                    color: (property.marketEstimate.label === 'Overpriced' ? '#ab584a' : '#3A7596'),
                                                    fontSize: '0.6rem',
                                                    padding: '0.3rem 0.6rem'
                                                }}>
                                                    {property.marketEstimate.label.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-quick-info">
                                <div className="detail-qi-item">
                                    <span className="detail-qi-icon"><i className="fa-solid fa-bed"></i></span>
                                    <div>
                                        <span className="detail-qi-value">{property.rooms}</span>
                                        <span className="detail-qi-label">Bedrooms</span>
                                    </div>
                                </div>
                                <div className="detail-qi-divider" />
                                <div className="detail-qi-item">
                                    <span className="detail-qi-icon"><i className="fa-solid fa-bath"></i></span>
                                    <div>
                                        <span className="detail-qi-value">{property.bathrooms}</span>
                                        <span className="detail-qi-label">Bathrooms</span>
                                    </div>
                                </div>
                                <div className="detail-qi-divider" />
                                <div className="detail-qi-item">
                                    <span className="detail-qi-icon"><i className="fa-solid fa-maximize"></i></span>
                                    <div>
                                        <span className="detail-qi-value">{property.sqm} m²</span>
                                        <span className="detail-qi-label">Area</span>
                                    </div>
                                </div>
                                <div className="detail-qi-divider" />
                                <div className="detail-qi-item">
                                    <span className="detail-qi-icon"><i className="fa-solid fa-building"></i></span>
                                    <div>
                                        <span className="detail-qi-value">{property.floor}/{property.totalFloors}</span>
                                        <span className="detail-qi-label">Floor</span>
                                    </div>
                                </div>
                                <div className="detail-qi-divider" />
                                <div className="detail-qi-item">
                                    <span className="detail-qi-icon"><i className="fa-solid fa-door-open"></i></span>
                                    <div>
                                        <span className="detail-qi-value">{property.totalRooms}</span>
                                        <span className="detail-qi-label">Rooms</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-highlights">
                                {property.hasElevator && (
                                    <div className="detail-hl-chip"><span className="detail-hl-dot" style={{ background: '#27ae60' }} />Elevator</div>
                                )}
                                {property.hasTerrace && (
                                    <div className="detail-hl-chip"><span className="detail-hl-dot" style={{ background: '#e67e22' }} />Terrace</div>
                                )}
                                {property.hasParking && (
                                    <div className="detail-hl-chip"><span className="detail-hl-dot" style={{ background: '#2980b9' }} />Parking</div>
                                )}
                                {property.isFurnished && (
                                    <div className="detail-hl-chip"><span className="detail-hl-dot" style={{ background: '#8e44ad' }} />Furnished</div>
                                )}
                                {property.balconies > 0 && (
                                    <div className="detail-hl-chip"><span className="detail-hl-dot" style={{ background: '#16a085' }} />{property.balconies} Balcony{property.balconies > 1 ? 'ies' : ''}</div>
                                )}
                                <div className="detail-hl-chip detail-hl-chip-accent">
                                    {property.furnishingStatus}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h2 className="detail-section-title">Property Features</h2>
                                <div className="detail-features-grid">
                                    {property.features.map((feature, index) => (
                                        <div key={index} className="detail-feature-item">
                                            <span className="detail-feature-check">+</span>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {property.description && (
                                <div className="detail-section">
                                    <h2 className="detail-section-title">Description</h2>
                                    <p className="detail-description">{property.description}</p>
                                </div>
                            )}

                            {property.marketInsight && (
                                <div className="detail-section">
                                    <MarketInsights insight={property.marketInsight} />
                                </div>
                            )}
                        </div>

                        <div className="detail-sidebar">
                            {property.marketEstimate && (
                                <PriceEstimate
                                    estimate={property.marketEstimate}
                                    listingPrice={property.priceEur}
                                />
                            )}

                            <div className="detail-contact-card">
                                <h3 className="detail-contact-heading">Interested in this property?</h3>
                                <p className="detail-contact-sub">Book a viewing or request more information from the EstateX Tirana team.</p>

                                <button
                                    onClick={() => navigate('/contact')}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginBottom: '0.75rem' }}
                                >
                                    Contact an Advisor
                                </button>

                                <button
                                    onClick={() => navigate('/contact')}
                                    className="btn btn-secondary"
                                    style={{ width: '100%' }}
                                >
                                    Schedule a Visit
                                </button>

                                <div className="detail-contact-info">
                                    <p>Phone +355 69 123 4567</p>
                                    <p>Email hello@estatextirana.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {property.comparables && property.comparables.length > 0 && (
                        <ComparableProperties
                            comps={property.comparables}
                            currentPropertyId={property.id}
                        />
                    )}
                </div>
            </section>
        </>
    )
}

export default PropertyDetail
