import { useNavigate } from 'react-router-dom'

const SellPropertyPage = () => {
    const navigate = useNavigate()

    return (
        <>
            <div style={{ height: '85px' }}></div>

            <section className="service-hero">
                <h1 className="service-hero-title">Sell Property</h1>
                <p className="service-hero-subtitle">
                    Maximize your property&apos;s presence and value with strategic positioning and premium marketing.
                </p>
            </section>

            <div className="service-content">
                <div className="service-section">
                    <h2 className="service-section-title">Sell with stronger presentation</h2>
                    <p className="service-section-text">
                        EstateX Tirana brings together pricing intelligence, elevated design, and targeted exposure to present
                        your property with the standard it deserves.
                    </p>
                    <p className="service-section-text">
                        From launch strategy to negotiation and closing, we help owners move with confidence and clarity.
                    </p>
                </div>

                <div className="service-features">
                    <div className="service-feature-card">
                        <div className="service-feature-icon">Value</div>
                        <h3 className="service-feature-title">Property Valuation</h3>
                        <p className="service-feature-text">
                            Set a confident price using current market signals, comparable sales, and positioning insight.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Media</div>
                        <h3 className="service-feature-title">Premium Marketing</h3>
                        <p className="service-feature-text">
                            Showcase your property with polished imagery, storytelling, and high-impact listing presentation.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Reach</div>
                        <h3 className="service-feature-title">Targeted Exposure</h3>
                        <p className="service-feature-text">
                            Reach motivated buyers through the channels and audiences most likely to convert.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Stage</div>
                        <h3 className="service-feature-title">Presentation Advice</h3>
                        <p className="service-feature-text">
                            Improve first impressions with practical staging and positioning recommendations.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Negotiate</div>
                        <h3 className="service-feature-title">Negotiation</h3>
                        <p className="service-feature-text">
                            Protect your value with measured, data-backed negotiation from inquiry to offer.
                        </p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Close</div>
                        <h3 className="service-feature-title">Smooth Closing</h3>
                        <p className="service-feature-text">
                            Stay supported through coordination, due diligence, and final transaction steps.
                        </p>
                    </div>
                </div>

                <div className="service-section">
                    <h2 className="service-section-title">Why sellers choose EstateX Tirana</h2>
                    <p className="service-section-text">
                        <strong>Sharper positioning:</strong> We turn raw listings into premium market presentations.
                    </p>
                    <p className="service-section-text">
                        <strong>Practical strategy:</strong> Pricing, timing, and messaging are aligned to buyer behavior.
                    </p>
                    <p className="service-section-text">
                        <strong>Hands-on support:</strong> We stay present through the full selling cycle.
                    </p>
                </div>

                <div className="service-cta">
                    <h2 className="service-cta-title">Ready to sell with more confidence?</h2>
                    <p className="service-cta-text">
                        Request a valuation or speak with our team about your next steps.
                    </p>
                    <div className="service-cta-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/services/valuation')}>
                            Get a Valuation
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

export default SellPropertyPage
