import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ValuationPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        address: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        yearBuilt: '',
        name: '',
        email: '',
        phone: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        alert('Thank you. We will contact you within 24 hours with your valuation.')
        navigate('/contact')
    }

    return (
        <>
            <div style={{ height: '85px' }}></div>

            <section className="service-hero">
                <h1 className="service-hero-title">Property Valuation</h1>
                <p className="service-hero-subtitle">
                    Understand your property&apos;s market position with a more complete and data-aware assessment.
                </p>
            </section>

            <div className="service-content">
                <div className="service-section">
                    <h2 className="service-section-title">Accurate valuation for better decisions</h2>
                    <p className="service-section-text">
                        A strong valuation is the foundation for pricing, negotiation, and timing. EstateX Tirana blends
                        comparable sales, neighborhood performance, and presentation quality into a more useful market reading.
                    </p>
                </div>

                <div className="service-features">
                    <div className="service-feature-card">
                        <div className="service-feature-icon">CMA</div>
                        <h3 className="service-feature-title">Comparable Analysis</h3>
                        <p className="service-feature-text">Recent sales and active listings provide the base for valuation accuracy.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Area</div>
                        <h3 className="service-feature-title">Neighborhood Trends</h3>
                        <p className="service-feature-text">We interpret local demand, supply, and location premiums clearly.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Inspect</div>
                        <h3 className="service-feature-title">Property Review</h3>
                        <p className="service-feature-text">Condition, finish level, and practical advantages all shape value.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Outlook</div>
                        <h3 className="service-feature-title">Market Outlook</h3>
                        <p className="service-feature-text">We highlight timing considerations and current pricing pressure.</p>
                    </div>
                </div>

                <div className="service-form-card">
                    <h2 className="service-section-title" style={{ textAlign: 'center' }}>
                        Request Your Free Valuation
                    </h2>
                    <p className="service-section-text" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        Share the basics below and receive a tailored response from our team.
                    </p>

                    <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="service-form-grid">
                            <div className="form-group">
                                <label className="form-label">Property Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-input"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Street, area, city"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Property Type *</label>
                                <select
                                    name="propertyType"
                                    className="form-input"
                                    value={formData.propertyType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Land">Land</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Bedrooms</label>
                                <input type="number" name="bedrooms" className="form-input" value={formData.bedrooms} onChange={handleChange} min="0" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Bathrooms</label>
                                <input type="number" name="bathrooms" className="form-input" value={formData.bathrooms} onChange={handleChange} min="0" step="0.5" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Area (m2)</label>
                                <input type="number" name="sqft" className="form-input" value={formData.sqft} onChange={handleChange} min="20" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Year Built</label>
                                <input type="number" name="yearBuilt" className="form-input" value={formData.yearBuilt} onChange={handleChange} min="1800" max="2026" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Your Name *</label>
                                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} required />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary service-form-submit">
                            Get Free Valuation
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ValuationPage
