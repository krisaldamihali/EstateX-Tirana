import { useEffect, useState } from 'react'
import { fetchNeighborhoods } from '../services/api'
import { useAuth } from '../context/AuthContext'

const SearchFilter = ({ onFilterChange }) => {
    const { user, openAuthModal } = useAuth()
    const [neighborhoods, setNeighborhoods] = useState([])
    const [filters, setFilters] = useState({
        search: '',
        neighborhood: '',
        minPrice: '',
        maxPrice: '',
        rooms: '',
        bathrooms: '',
        minSqm: '',
        maxSqm: '',
        furnished: '',
        elevator: '',
        terrace: '',
        tag: ''
    })
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        fetchNeighborhoods()
            .then(data => setNeighborhoods(data.map(n => n.name)))
            .catch(() => setNeighborhoods([]))
    }, [])

    const handleChange = (e) => {
        if (!user) {
            openAuthModal('Please sign in to search and filter properties.')
            return
        }
        const newFilters = {
            ...filters,
            [e.target.name]: e.target.value
        }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const handleReset = () => {
        if (!user) {
            openAuthModal()
            return
        }
        const resetFilters = {
            search: '',
            neighborhood: '',
            minPrice: '',
            maxPrice: '',
            rooms: '',
            bathrooms: '',
            minSqm: '',
            maxSqm: '',
            furnished: '',
            elevator: '',
            terrace: '',
            tag: ''
        }
        setFilters(resetFilters)
        onFilterChange(resetFilters)
    }

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

    return (
        <div className="search-filter-luxury">
            <div className="search-hero">
                <div className="search-hero-content">
                    <h3 className="search-hero-title">Find your next address in Tirana</h3>
                    <div className="search-hero-bar">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search by name, area, or address"
                            className="search-hero-input"
                            value={filters.search}
                            onChange={handleChange}
                        />
                        <button
                            className="search-filter-toggle"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            Advanced
                            {activeFiltersCount > 0 && (
                                <span className="filter-badge">{activeFiltersCount}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`filters-advanced ${isExpanded ? 'expanded' : ''}`}>
                <div className="filters-grid-luxury">
                    <div className="filter-card">
                        <div className="filter-card-icon">Area</div>
                        <label className="filter-card-label">Neighborhood</label>
                        <select
                            name="neighborhood"
                            className="filter-card-select"
                            value={filters.neighborhood}
                            onChange={handleChange}
                        >
                            <option value="">All</option>
                            {neighborhoods.map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-card filter-card-wide">
                        <div className="filter-card-icon">EUR</div>
                        <label className="filter-card-label">Price range</label>
                        <div className="price-range-inputs">
                            <select name="minPrice" className="filter-card-select" value={filters.minPrice} onChange={handleChange}>
                                <option value="">Min</option>
                                <option value="30000">EUR 30,000</option>
                                <option value="50000">EUR 50,000</option>
                                <option value="75000">EUR 75,000</option>
                                <option value="100000">EUR 100,000</option>
                                <option value="150000">EUR 150,000</option>
                                <option value="200000">EUR 200,000</option>
                            </select>
                            <span className="price-separator">to</span>
                            <select name="maxPrice" className="filter-card-select" value={filters.maxPrice} onChange={handleChange}>
                                <option value="">Max</option>
                                <option value="80000">EUR 80,000</option>
                                <option value="100000">EUR 100,000</option>
                                <option value="150000">EUR 150,000</option>
                                <option value="200000">EUR 200,000</option>
                                <option value="300000">EUR 300,000</option>
                                <option value="500000">EUR 500,000</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-card">
                        <div className="filter-card-icon">Bed</div>
                        <label className="filter-card-label">Bedrooms</label>
                        <select name="rooms" className="filter-card-select" value={filters.rooms} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="4">4+</option>
                            <option value="5">5+</option>
                        </select>
                    </div>

                    <div className="filter-card">
                        <div className="filter-card-icon">Bath</div>
                        <label className="filter-card-label">Bathrooms</label>
                        <select name="bathrooms" className="filter-card-select" value={filters.bathrooms} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                        </select>
                    </div>

                    <div className="filter-card filter-card-wide">
                        <div className="filter-card-icon">m2</div>
                        <label className="filter-card-label">Area size</label>
                        <div className="price-range-inputs">
                            <select name="minSqm" className="filter-card-select" value={filters.minSqm} onChange={handleChange}>
                                <option value="">Min</option>
                                <option value="30">30 m2</option>
                                <option value="50">50 m2</option>
                                <option value="70">70 m2</option>
                                <option value="100">100 m2</option>
                                <option value="150">150 m2</option>
                            </select>
                            <span className="price-separator">to</span>
                            <select name="maxSqm" className="filter-card-select" value={filters.maxSqm} onChange={handleChange}>
                                <option value="">Max</option>
                                <option value="50">50 m2</option>
                                <option value="80">80 m2</option>
                                <option value="100">100 m2</option>
                                <option value="150">150 m2</option>
                                <option value="200">200 m2</option>
                                <option value="300">300 m2+</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-card">
                        <div className="filter-card-icon">Fit</div>
                        <label className="filter-card-label">Furnished</label>
                        <select name="furnished" className="filter-card-select" value={filters.furnished} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div className="filter-card">
                        <div className="filter-card-icon">Lift</div>
                        <label className="filter-card-label">Elevator</label>
                        <select name="elevator" className="filter-card-select" value={filters.elevator} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>

                    <div className="filter-card">
                        <div className="filter-card-icon">Open</div>
                        <label className="filter-card-label">Terrace</label>
                        <select name="terrace" className="filter-card-select" value={filters.terrace} onChange={handleChange}>
                            <option value="">Any</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                </div>

                {activeFiltersCount > 0 && (
                    <div className="filter-actions">
                        <button onClick={handleReset} className="btn-reset-minimal">
                            Clear all
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchFilter
