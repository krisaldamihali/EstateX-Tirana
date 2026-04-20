import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const formatEur = (n) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const SearchAdPopup = ({ searchTerm, neighborhood, visible, onClose }) => {
    const navigate = useNavigate()
    const [dismissed, setDismissed] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)
    const [adProperties, setAdProperties] = useState([])

    const contextLabel = (() => {
        if (neighborhood) return neighborhood
        if (searchTerm) return searchTerm
        return ''
    })()

    useEffect(() => {
        if (!visible || dismissed || !contextLabel) {
            setAdProperties([])
            return
        }

        const params = new URLSearchParams()
        if (neighborhood) {
            params.set('neighborhood', neighborhood)
        } else if (searchTerm && searchTerm.trim().length >= 2) {
            params.set('search', searchTerm.trim())
        } else {
            setAdProperties([])
            return
        }

        params.set('sort', 'price_sqm')
        params.set('pageSize', '6')
        params.set('page', '1')

        let cancelled = false
        fetch(`/api/properties?${params}`)
            .then(r => r.json())
            .then(data => {
                if (cancelled) return
                const matched = (data.properties || []).filter(p => p.sqm > 0)
                const term = searchTerm?.trim().toLowerCase() || ''
                const strict = neighborhood
                    ? matched
                    : matched.filter(p =>
                        p.neighborhood?.toLowerCase().includes(term) ||
                        p.address?.toLowerCase().includes(term)
                    )

                setAdProperties(strict.slice(0, 3))
            })
            .catch(() => {
                if (!cancelled) setAdProperties([])
            })

        return () => {
            cancelled = true
        }
    }, [visible, dismissed, searchTerm, neighborhood, contextLabel])

    const shouldShow = visible && !dismissed && contextLabel && adProperties.length > 0

    useEffect(() => {
        if (shouldShow) {
            const timer = setTimeout(() => setAnimateIn(true), 100)
            return () => clearTimeout(timer)
        }

        setAnimateIn(false)
    }, [shouldShow])

    useEffect(() => {
        if (shouldShow) {
            const timer = setTimeout(() => {
                setAnimateIn(false)
                setTimeout(() => setDismissed(true), 300)
            }, 15000)
            return () => clearTimeout(timer)
        }
    }, [shouldShow])

    useEffect(() => {
        setDismissed(false)
    }, [searchTerm, neighborhood])

    const handleClose = () => {
        setAnimateIn(false)
        setTimeout(() => {
            setDismissed(true)
            if (onClose) onClose()
        }, 300)
    }

    const handlePropertyClick = (id) => {
        handleClose()
        navigate(`/property/${id}`)
    }

    if (!shouldShow) return null

    return (
        <div className={`search-ad-overlay ${animateIn ? 'active' : ''}`}>
            <div className={`search-ad-popup ${animateIn ? 'active' : ''}`}>
                <button className="search-ad-close" onClick={handleClose}>x</button>

                <div className="search-ad-header">
                    <div className="search-ad-badge">Top Picks</div>
                    <h3 className="search-ad-title">
                        Best opportunities in <span className="search-ad-highlight">{contextLabel}</span>
                    </h3>
                    <p className="search-ad-subtitle">
                        We found {adProperties.length} strong-value {adProperties.length === 1 ? 'property' : 'properties'} for your search
                    </p>
                </div>

                <div className="search-ad-cards">
                    {adProperties.map((prop) => (
                        <div
                            className="search-ad-card"
                            key={prop.id}
                            onClick={() => handlePropertyClick(prop.id)}
                        >
                            <div
                                className="search-ad-card-img"
                                style={{
                                    backgroundImage: `url(${prop.image || prop.images?.[0] || ''})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <span className="search-ad-card-tag">Best Value</span>
                            </div>
                            <div className="search-ad-card-info">
                                <div className="search-ad-card-price">{formatEur(prop.priceEur)}</div>
                                <div className="search-ad-card-title">{prop.title}</div>
                                <div className="search-ad-card-meta">
                                    <span>Area {prop.neighborhood}</span>
                                    <span>{prop.sqm} m2</span>
                                    <span>Rooms {prop.rooms}</span>
                                </div>
                                <div className="search-ad-card-ppsqm">
                                    {formatEur(Math.round(prop.priceEur / prop.sqm))}/m2
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="search-ad-footer">
                    <button className="search-ad-dismiss" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SearchAdPopup
