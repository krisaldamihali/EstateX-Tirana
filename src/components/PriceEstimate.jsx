import { useState } from 'react'

const formatEur = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const formatK = (n) => {
  if (n >= 1000) return `EUR ${Math.round(n / 1000)}k`
  return `EUR ${Math.round(n)}`
}

const labelConfig = {
  Overpriced: { color: '#b35b4c', bg: 'rgba(239, 166, 145, 0.18)', tag: 'Above', text: 'Above market price' },
  Fair: { color: '#2f6b5b', bg: 'rgba(97, 167, 143, 0.18)', tag: 'Fair', text: 'Fair market price' },
  Underpriced: { color: '#2c5f8b', bg: 'rgba(102, 161, 214, 0.18)', tag: 'Value', text: 'Below market price' },
}

const PriceEstimate = ({ estimate, listingPrice }) => {
  const [showDetails, setShowDetails] = useState(false)

  if (!estimate) return null

  const { estimated, low, high, label, diffPercent, pricePerSqm } = estimate
  const diff = listingPrice ? listingPrice - estimated : 0
  const cfg = labelConfig[label] || labelConfig.Fair
  const valuationLabel = `${cfg.text}${diffPercent !== 0 ? ` (${diffPercent > 0 ? '+' : ''}${diffPercent}%)` : ''}`

  const padding = (high - low) * 0.25
  const visMin = low - padding
  const visMax = high + padding
  const visSpan = visMax - visMin || 1

  const fairLeft = ((low - visMin) / visSpan) * 100
  const fairWidth = ((high - low) / visSpan) * 100
  const listingPct = listingPrice
    ? Math.max(2, Math.min(98, ((listingPrice - visMin) / visSpan) * 100))
    : null

  return (
    <div className="price-estimate-card">
      <div className="pe-header">
        <div className="pe-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h3 className="pe-title">Price Estimate</h3>
          <p className="pe-subtitle">{estimate.method === 'ml' ? 'AI-backed market estimate' : 'Based on comparable listings'}</p>
        </div>
      </div>

      <div className="pe-valuation-label" style={{ background: cfg.bg, color: cfg.color }}>
        <span style={{ fontWeight: 600 }}>{valuationLabel}</span>
      </div>

      <div className="pe-value-row">
        <span className="pe-value">{formatEur(estimated)}</span>
        {pricePerSqm > 0 && (
          <span className="pe-sqm-price">{formatEur(pricePerSqm)}/m2</span>
        )}
      </div>

      <div className="pe-range-visual">
        <div className="pe-range-track">
          <div className="pe-zone pe-zone-under" style={{ width: `${fairLeft}%` }} />
          <div className="pe-zone pe-zone-fair" style={{ width: `${fairWidth}%` }} />
          <div className="pe-zone pe-zone-over" style={{ width: `${100 - fairLeft - fairWidth}%` }} />

          {listingPct !== null && (
            <div className="pe-pointer" style={{ left: `${listingPct}%` }}>
              <div className="pe-pointer-line" />
            </div>
          )}
        </div>

        <div className="pe-zone-labels">
          <span className="pe-zone-lbl pe-zone-lbl-under">Below</span>
          <span className="pe-zone-lbl pe-zone-lbl-fair">Fair range</span>
          <span className="pe-zone-lbl pe-zone-lbl-over">Above</span>
        </div>

        <div className="pe-price-anchors">
          <span>{formatK(low)}</span>
          <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{formatK(estimated)}</span>
          <span>{formatK(high)}</span>
        </div>
      </div>

      <div className="pe-summary">
        <div className="pe-summary-item">
          <span className="pe-summary-label">Fair range</span>
          <span className="pe-summary-value">{formatEur(low)} to {formatEur(high)}</span>
        </div>
        <div className="pe-summary-item">
          <span className="pe-summary-label">Listed at</span>
          <span className="pe-summary-value">{formatEur(listingPrice)}</span>
        </div>
        {diff !== 0 && (
          <div className="pe-summary-item">
            <span className="pe-summary-label">Difference</span>
            <span className={`pe-summary-value ${diff > 0 ? 'pe-text-over' : 'pe-text-under'}`}>
              {diff > 0 ? '+' : ''}{formatEur(diff)}
            </span>
          </div>
        )}
      </div>

      <button className="pe-details-toggle" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide' : 'Show'} details
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showDetails && (
        <div className="pe-details">
          <div className="pe-detail-row">
            <span>Low estimate</span>
            <strong>{formatEur(low)}</strong>
          </div>
          <div className="pe-detail-row">
            <span>AI estimate</span>
            <strong style={{ color: 'var(--secondary)' }}>{formatEur(estimated)}</strong>
          </div>
          <div className="pe-detail-row">
            <span>High estimate</span>
            <strong>{formatEur(high)}</strong>
          </div>
          <div className="pe-detail-row">
            <span>Price per m2</span>
            <strong>{formatEur(pricePerSqm)}/m2</strong>
          </div>
          <p className="pe-disclaimer">
            Estimated by a stacked machine learning model trained on Tirana market data. Not an official appraisal.
          </p>
        </div>
      )}
    </div>
  )
}

export default PriceEstimate
