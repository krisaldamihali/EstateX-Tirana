import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'

const formatEur = (n) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const FavoritesPage = () => {
    const navigate = useNavigate()
    const { user, loading: authLoading, openAuthModal } = useAuth()
    const { 
        favorites, 
        toggleFavorite, 
        isInCompare, 
        toggleCompare, 
        showNotification,
        loading 
    } = useFavorites()

    if (authLoading || (user && loading)) {
        return (
            <>
                <div style={{ height: '85px' }}></div>
                <div className="listings-loading" style={{ minHeight: '50vh' }}>
                    <div className="loading-spinner" />
                    <p>Loading saved properties...</p>
                </div>
            </>
        )
    }

    if (!user) {
        return (
            <>
                <div style={{ height: '85px' }}></div>
                <section className="section">
                    <h2 className="section-title">Saved Properties</h2>
                    <p className="section-subtitle">Sign in first to keep your saved homes synced in the database.</p>

                    <div className="favorites-empty">
                        <div className="favorites-empty-icon">Lock</div>
                        <h2>Your shortlist needs an account</h2>
                        <p>Sign in to save favorites in SQLite and keep them available when you come back.</p>
                        <button className="btn btn-primary" onClick={() => openAuthModal('Sign in to view and save Favorites.')}>
                            Sign In
                        </button>
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <div style={{ height: '85px' }}></div>
            <section className="section">
                <h2 className="section-title">Saved Properties</h2>
                <p className="section-subtitle">
                    {favorites.length > 0 ? `${favorites.length} saved properties` : 'You have not saved any properties yet'}
                </p>

                {favorites.length === 0 ? (
                    <div className="favorites-empty">
                        <div className="favorites-empty-icon">Saved</div>
                        <h2>Your shortlist is still empty</h2>
                        <p>Add properties to favorites and come back to compare your best options.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                            Explore Properties
                        </button>
                    </div>
                ) : (
                    <div className="property-grid">
                        {favorites.map(property => (
                            <div className="property-card" key={property.id}>
                                <div
                                    className="property-image"
                                    style={{
                                        backgroundImage: `url(${property.image || property.images?.[0]})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                    onClick={() => navigate(`/property/${property.id}`)}
                                >
                                    <div className="card-actions" onClick={e => e.stopPropagation()}>
                                        <button
                                            className="card-action-btn favorited"
                                            onClick={() => toggleFavorite(property)}
                                            title="Remove from favorites"
                                        >
                                            <i className="fa-solid fa-heart"></i>
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
                                <div className="property-info" onClick={() => navigate(`/property/${property.id}`)} style={{ cursor: 'pointer' }}>
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
                )}
            </section>
        </>
    )
}

export default FavoritesPage
