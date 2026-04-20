import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

const formatEur = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const labelColors = {
  Overpriced: { color: '#b35b4c', bg: 'rgba(239, 166, 145, 0.18)', text: 'Above market' },
  Fair: { color: '#2f6b5b', bg: 'rgba(97, 167, 143, 0.18)', text: 'Fair value' },
  Underpriced: { color: '#2c5f8b', bg: 'rgba(102, 161, 214, 0.18)', text: 'Opportunity' },
}

const ComparableProperties = ({ comps }) => {
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite, isInCompare, toggleCompare, showNotification } = useFavorites()

  if (!comps || comps.length === 0) return null

  return (
    <div className="comps-section">
      <div className="comps-header">
        <h2 className="comps-title">Similar Properties</h2>
        <p className="comps-subtitle">
          {comps.length} comparable listings selected by location, size, and features
        </p>
      </div>

      <div className="comps-grid">
        {comps.map((comp) => {
          const estimate = comp.marketEstimate
          const lbl = estimate ? labelColors[estimate.label] || labelColors.Fair : null
          return (
            <div
              className="comp-card"
              key={comp.id}
              onClick={() => {
                navigate(`/property/${comp.id}`)
                window.scrollTo(0, 0)
              }}
            >
              <div
                className="comp-card-image"
                style={{ backgroundImage: `url(${comp.image || comp.images?.[0]})` }}
              >
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button
                        className={`card-action-btn ${isFavorite(comp.id) ? 'favorited' : ''}`}
                        onClick={() => toggleFavorite(comp)}
                        title={isFavorite(comp.id) ? 'Remove' : 'Save'}
                    >
                        <i className={isFavorite(comp.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
                    <button
                        className={`card-action-btn ${isInCompare(comp.id) ? 'compared' : ''}`}
                        onClick={async () => {
                            const res = await toggleCompare(comp)
                            if (res && res.error) {
                                showNotification(res.error, "Comparison Limit")
                            }
                        }}
                        title={isInCompare(comp.id) ? 'Remove from compare' : 'Add to compare'}
                    >
                        <i className="fa-solid fa-scale-balanced"></i>
                    </button>
                </div>
              </div>

              <div className="comp-card-body">
                <div className="comp-card-badges" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <span className="comp-card-tag">{comp.tag}</span>
                    {estimate && (
                        <span className="card-valuation-label" style={{ background: lbl.bg, color: lbl.color, position: 'static', margin: 0, fontSize: '0.6rem', padding: '0.3rem 0.6rem' }}>
                            {lbl.text.toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="comp-card-price" style={{ marginBottom: '0.25rem' }}>{formatEur(comp.priceEur)}</div>
                <h4 className="comp-card-title">{comp.title}</h4>
                <p className="comp-card-location">Area {comp.neighborhood}</p>

                <div className="comp-card-features">
                  <span>Rooms {comp.rooms}</span>
                  <span>Baths {comp.bathrooms}</span>
                  <span>{comp.sqm} m2</span>
                  <span>Floor {comp.floor}</span>
                </div>

                {comp.similarityReasons && comp.similarityReasons.length > 0 && (
                  <div className="comp-card-reasons">
                    {comp.similarityReasons.map((reason, i) => (
                      <span key={i} className="comp-reason-tag">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {estimate && (
                  <div className="comp-card-estimate">
                    <span className="comp-est-label">Est.</span>
                    <span className="comp-est-value">{formatEur(estimate.estimated)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ComparableProperties
