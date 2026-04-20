import { useNavigate } from 'react-router-dom'

const BuyPropertyPage = () => {
    const navigate = useNavigate()

    return (
        <>
            <div style={{ height: '85px' }}></div>

            <section className="service-hero">
                <h1 className="service-hero-title">Buy Property</h1>
                <p className="service-hero-subtitle">
                    Discover the right home in Tirana with strategic guidance, elegant presentation, and local expertise.
                </p>
            </section>

            <div className="service-content">
                <div className="service-section">
                    <h2 className="service-section-title">A more precise buying journey</h2>
                    <p className="service-section-text">
                        EstateX Tirana helps buyers move with confidence, from first search to final signature.
                        We combine curated listings, market insight, and honest guidance so every step feels clear.
                    </p>
                    <p className="service-section-text">
                        Whether you are searching for a city apartment, a family residence, or a smart long-term asset,
                        our team aligns the process with your budget, timing, and lifestyle priorities.
                    </p>
                </div>

                <div className="service-features">
                    <div className="service-feature-card">
                        <div className="service-feature-icon">Search</div>
                        <h3 className="service-feature-title">Curated Search</h3>
                        <p className="service-feature-text">
                            Access listings selected for quality, location, and fit with your brief.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Plan</div>
                        <h3 className="service-feature-title">Budget Strategy</h3>
                        <p className="service-feature-text">
                            Understand pricing, financing options, and value benchmarks before you commit.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Data</div>
                        <h3 className="service-feature-title">Market Analysis</h3>
                        <p className="service-feature-text">
                            Review neighborhood demand, price ranges, and comparable opportunities with clarity.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Tour</div>
                        <h3 className="service-feature-title">Private Viewings</h3>
                        <p className="service-feature-text">
                            Schedule visits that focus on fit, not just features, with thoughtful property walkthroughs.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Offer</div>
                        <h3 className="service-feature-title">Offer Guidance</h3>
                        <p className="service-feature-text">
                            Make stronger offers backed by data and realistic negotiation strategy.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Close</div>
                        <h3 className="service-feature-title">Closing Support</h3>
                        <p className="service-feature-text">
                            Stay supported through due diligence, paperwork, and final coordination.
                        </p>
                    </div>
                </div>

                <div className="service-section">
                    <h2 className="service-section-title">The EstateX difference</h2>
                    <p className="service-section-text">
                        <strong>Refined selection:</strong> We focus on properties worth your time.
                    </p>
                    <p className="service-section-text">
                        <strong>Local intelligence:</strong> We translate Tirana market dynamics into clear recommendations.
                    </p>
                    <p className="service-section-text">
                        <strong>Discreet guidance:</strong> The process stays personal, calm, and professionally managed.
                    </p>
                </div>

                <div className="service-cta">
                    <h2 className="service-cta-title">Ready to find your next property?</h2>
                    <p className="service-cta-text">
                        Explore available listings or speak with an advisor for a more tailored search.
                    </p>
                    <div className="service-cta-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/listings')}>
                            View Properties
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/contact')}>
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BuyPropertyPage
