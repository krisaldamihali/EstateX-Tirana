import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'

const formatEur = (n) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const ComparePage = () => {
    const navigate = useNavigate()
    const { user, loading: authLoading, openAuthModal } = useAuth()
    const { compareList, clearCompare, toggleCompare, loading } = useFavorites()

    if (authLoading || (user && loading)) {
        return (
            <>
                <div style={{ height: '85px' }}></div>
                <div className="listings-loading" style={{ minHeight: '50vh' }}>
                    <div className="loading-spinner" />
                    <p>Loading comparison list...</p>
                </div>
            </>
        )
    }

    if (!user) {
        return (
            <>
                <div style={{ height: '85px' }}></div>
                <section className="section compare-empty">
                    <h2 className="section-title">Property Comparison</h2>
                    <p className="section-subtitle">Sign in first to keep your comparison list synced in the database.</p>
                    <button className="btn btn-primary" onClick={() => openAuthModal('Bëj login që të përdorësh Compare.')}>
                        Sign In
                    </button>
                </section>
            </>
        )
    }

    if (compareList.length === 0) {
        return (
            <>
                <div style={{ height: '85px' }}></div>
                <section className="section compare-empty">
                    <h2 className="section-title">Property Comparison</h2>
                    <p className="section-subtitle">You have not added any properties to compare yet.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                        Go to Listings
                    </button>
                </section>
            </>
        )
    }

    const fields = [
        { key: 'priceEur', label: 'Price', format: v => formatEur(v) },
        { key: 'sqm', label: 'Area', format: v => `${v} m2` },
        { key: 'priceSqm', label: 'EUR/m2', format: v => formatEur(v) },
        { key: 'rooms', label: 'Bedrooms', format: v => v },
        { key: 'bathrooms', label: 'Bathrooms', format: v => v },
        { key: 'floor', label: 'Floor', format: v => v },
        { key: 'neighborhood', label: 'Area', format: v => v },
        { key: 'hasElevator', label: 'Elevator', format: v => v ? 'Yes' : 'No' },
        { key: 'hasTerrace', label: 'Terrace', format: v => v ? 'Yes' : 'No' },
        { key: 'isFurnished', label: 'Furnished', format: v => v ? 'Yes' : 'No' },
    ]

    const enriched = compareList.map(p => ({
        ...p,
        priceSqm: p.sqm ? Math.round(p.priceEur / p.sqm) : 0
    }))

    return (
        <>
            <div style={{ height: '85px' }}></div>
            <section className="section">
                <div className="compare-header">
                    <div>
                        <h2 className="section-title compare-title">Property Comparison</h2>
                        <p className="section-subtitle compare-subtitle">{compareList.length} properties selected</p>
                    </div>
                    <button className="btn btn-secondary compare-clear-btn" onClick={clearCompare}>
                        Clear List
                    </button>
                </div>

                <div className="compare-table-wrapper">
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th className="compare-label-col"></th>
                                {enriched.map(p => (
                                    <th key={p.id} className="compare-property-col">
                                        <div className="compare-property-header">
                                            <div
                                                className="compare-property-img"
                                                style={{ backgroundImage: `url(${p.image || p.images?.[0]})` }}
                                                onClick={() => navigate(`/property/${p.id}`)}
                                            />
                                            <h4 className="compare-property-name" onClick={() => navigate(`/property/${p.id}`)}>
                                                {p.title}
                                            </h4>
                                            <button className="compare-remove-btn" onClick={() => toggleCompare(p)}>
                                                x
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(field => {
                                const values = enriched.map(p => p[field.key])
                                const numericValues = values.filter(v => typeof v === 'number')
                                const bestValue = field.key === 'priceEur' || field.key === 'priceSqm'
                                    ? Math.min(...numericValues)
                                    : field.key === 'sqm' || field.key === 'rooms' || field.key === 'bathrooms'
                                        ? Math.max(...numericValues)
                                        : null

                                return (
                                    <tr key={field.key}>
                                        <td className="compare-label-cell">{field.label}</td>
                                        {enriched.map(p => {
                                            const val = p[field.key]
                                            const isBest = bestValue !== null && val === bestValue && numericValues.length > 1
                                            return (
                                                <td key={p.id} className={`compare-value-cell ${isBest ? 'compare-best' : ''}`}>
                                                    {field.format(val)}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    )
}

export default ComparePage
