const formatEur = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const MarketInsights = ({ insight }) => {
  if (!insight) return null

  return (
    <div className="market-insight-card">
      <div className="mi-header">
        <span className="mi-icon"><i className="fa-solid fa-chart-line"></i></span>
        <div>
          <h3 className="mi-title">Market Statistics</h3>
          <p className="mi-subtitle">Area: {insight.neighborhood}</p>
        </div>
      </div>

      <div className="mi-stats-grid">
        <div className="mi-stat">
          <span className="mi-stat-value">{formatEur(insight.avgPricePerSqm)}</span>
          <span className="mi-stat-label">Avg EUR/m2</span>
        </div>
        <div className="mi-stat">
          <span className="mi-stat-value">{formatEur(insight.avgPrice)}</span>
          <span className="mi-stat-label">Avg price</span>
        </div>
        <div className="mi-stat">
          <span className="mi-stat-value">{insight.avgSqm} m2</span>
          <span className="mi-stat-label">Avg area</span>
        </div>
        <div className="mi-stat">
          <span className="mi-stat-value">{insight.totalListings}</span>
          <span className="mi-stat-label">Listings in area</span>
        </div>
      </div>

      <div className="mi-range">
        <span className="mi-range-title">Price range per m2</span>
        <div className="mi-range-row">
          <div className="mi-range-item">
            <span className="mi-range-item-label">From</span>
            <span className="mi-range-item-value">{formatEur(insight.minPricePerSqm)}/m2</span>
          </div>
          <span className="mi-range-separator">to</span>
          <div className="mi-range-item">
            <span className="mi-range-item-label">To</span>
            <span className="mi-range-item-value">{formatEur(insight.maxPricePerSqm)}/m2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketInsights
