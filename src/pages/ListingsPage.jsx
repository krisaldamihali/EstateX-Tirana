import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropertyMap from '../components/PropertyMap'
import SearchFilter from '../components/SearchFilter'
import SearchAdPopup from '../components/SearchAdPopup'
import { fetchProperties } from '../services/api'
import { useFavorites } from '../context/FavoritesContext'

const formatEur = (n) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const labelColors = {
    Overpriced: { color: '#b35b4c', bg: 'rgba(239, 166, 145, 0.18)', copy: 'Above market' },
    Fair: { color: '#2f6b5b', bg: 'rgba(97, 167, 143, 0.18)', copy: 'Fair value' },
    Underpriced: { color: '#2c5f8b', bg: 'rgba(102, 161, 214, 0.18)', copy: 'Opportunity' },
}

const ListingsPage = () => {
    const navigate = useNavigate()
    const { toggleFavorite, isFavorite, toggleCompare, isInCompare, compareList, showNotification } = useFavorites()

    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sortBy, setSortBy] = useState('')
    const [currentFilters, setCurrentFilters] = useState({})
    const [viewMode, setViewMode] = useState('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [showAdPopup, setShowAdPopup] = useState(false)

    const loadProperties = useCallback(async (filters = {}, page = 1) => {
        setLoading(true)
        setError(null)
        try {
            const params = { ...filters, page, pageSize: 30 }
            if (sortBy) params.sort = sortBy
            const data = await fetchProperties(params)
            setProperties(data.properties || [])
            setTotalPages(data.totalPages || 1)
            setTotalResults(data.total || 0)
            setCurrentPage(data.page || 1)
        } catch (err) {
            console.error(err)
            setError('Failed to load properties. Make sure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }, [sortBy])

    useEffect(() => {
        loadProperties(currentFilters, currentPage)
    }, [sortBy])

    const handleFilterChange = (filters) => {
        setCurrentFilters(filters)
        setCurrentPage(1)
        loadProperties(filters, 1)

        const hasSearchContext = (filters.search && filters.search.trim().length >= 2) || filters.neighborhood
        setShowAdPopup(!!hasSearchContext)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        loadProperties(currentFilters, page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            <div style={{ height: '85px' }}></div>
            <section className="section">
                <h2 className="section-title">Properties in Tirana</h2>
                <p className="section-subtitle">Explore a refined collection of homes, apartments, and investment opportunities across the city.</p>

                <div style={{ marginBottom: '2rem' }}>
                    <SearchFilter onFilterChange={handleFilterChange} />
                </div>

                <div className="results-bar">
                    <div className="results-count">
                        <strong>{totalResults}</strong> {totalResults === 1 ? 'property' : 'properties'}
                        {compareList.length > 0 && (
                            <button
                                className="compare-floating-btn"
                                onClick={() => navigate('/compare')}
                            >
                                Compare ({compareList.length})
                            </button>
                        )}
                    </div>

                    <div className="results-actions">
                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                Grid
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                                onClick={() => setViewMode('map')}
                                title="Map view"
                            >
                                Map
                            </button>
                        </div>

                        <div className="sort-control">
                            <label htmlFor="sort-select">Sort</label>
                            <select id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                                <option value="">Default</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="newest">Newest</option>
                                <option value="sqm_desc">Largest</option>
                                <option value="price_sqm">Lowest EUR/m2</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="listings-loading">
                        <div className="loading-spinner" />
                        <p>Loading properties...</p>
                    </div>
                )}

                {error && (
                    <div className="listings-error">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => loadProperties(currentFilters, currentPage)}>
                            Try Again
                        </button>
                    </div>
                )}

                {viewMode === 'map' && !loading && !error && (
                    <div className="map-container" style={{ height: '700px', marginBottom: '2rem' }}>
                        <PropertyMap />
                    </div>
                )}

                {!loading && !error && properties.length > 0 && viewMode === 'grid' && (
                    <div className="property-grid">
                        {properties.map((property) => {
                            const est = property.marketEstimate
                            const lbl = est ? labelColors[est.label] || labelColors.Fair : null
                            return (
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

                                    <div className="property-info" onClick={() => navigate(`/property/${property.id}`)} style={{ cursor: 'pointer' }}>
                                        <div className="property-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                            <span className="property-tag" style={{ position: 'static', margin: 0 }}>{property.tag}</span>
                                            {est && (
                                                <span className="card-valuation-label" style={{ background: lbl.bg, color: lbl.color, position: 'static', margin: 0 }}>
                                                    {lbl.copy}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="property-price" style={{ marginBottom: '0.25rem' }}>{formatEur(property.priceEur)}</div>
                                        <h3 className="property-title">{property.title}</h3>
                                        <p className="property-location">Area {property.neighborhood}</p>

                                        <div className="property-features">
                                            <span className="feature">Rooms {property.rooms}</span>
                                            <span className="feature">Baths {property.bathrooms}</span>
                                            <span className="feature">{property.sqm} m2</span>
                                            <span className="feature">Floor {property.floor}</span>
                                        </div>

                                        <div className="property-extras">
                                            {property.hasElevator && <span className="extra-badge">Elevator</span>}
                                            {property.hasTerrace && <span className="extra-badge">Terrace</span>}
                                            {property.isFurnished && <span className="extra-badge">Furnished</span>}
                                        </div>

                                        {est && (
                                            <div className="property-ml-badge">
                                                <span>AI estimate {formatEur(est.estimated)}</span>
                                                <span className="ml-sqm">{formatEur(est.pricePerSqm)}/m2</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="pagination pagination-wrap">
                        <button
                            className="btn btn-secondary"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            style={{ padding: '0.5rem 1rem', opacity: currentPage <= 1 ? 0.5 : 1 }}
                        >
                            Prev
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let page
                            if (totalPages <= 7) {
                                page = i + 1
                            } else if (currentPage <= 4) {
                                page = i + 1
                            } else if (currentPage >= totalPages - 3) {
                                page = totalPages - 6 + i
                            } else {
                                page = currentPage - 3 + i
                            }

                            return (
                                <button
                                    key={page}
                                    className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handlePageChange(page)}
                                    style={{ padding: '0.5rem 1rem', minWidth: '2.5rem' }}
                                >
                                    {page}
                                </button>
                            )
                        })}
                        <button
                            className="btn btn-secondary"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            style={{ padding: '0.5rem 1rem', opacity: currentPage >= totalPages ? 0.5 : 1 }}
                        >
                            Next
                        </button>
                    </div>
                )}

                {!loading && !error && properties.length === 0 && (
                    <div className="no-results">
                        <h3>No properties found</h3>
                        <p>Try changing the filters to reveal more options.</p>
                    </div>
                )}
            </section>

            <SearchAdPopup
                searchTerm={currentFilters.search || ''}
                neighborhood={currentFilters.neighborhood || ''}
                visible={showAdPopup && !loading}
                onClose={() => setShowAdPopup(false)}
            />
        </>
    )
}

export default ListingsPage
