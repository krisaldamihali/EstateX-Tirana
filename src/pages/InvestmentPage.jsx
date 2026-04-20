import { useNavigate } from 'react-router-dom'

const InvestmentPage = () => {
    const navigate = useNavigate()

    return (
        <>
            <div style={{ height: '85px' }}></div>

            <section className="service-hero">
                <h1 className="service-hero-title">Investment Consulting</h1>
                <p className="service-hero-subtitle">
                    Build a stronger property strategy with local insight, disciplined analysis, and better presentation.
                </p>
            </section>

            <div className="service-content">
                <div className="service-section">
                    <h2 className="service-section-title">Invest with more clarity</h2>
                    <p className="service-section-text">
                        EstateX Tirana helps investors identify opportunities that balance growth potential, cash flow,
                        and long-term resilience in a fast-moving local market.
                    </p>
                    <p className="service-section-text">
                        From first acquisition to portfolio expansion, we help you evaluate risk and act with conviction.
                    </p>
                </div>

                <div className="service-features">
                    <div className="service-feature-card">
                        <div className="service-feature-icon">Plan</div>
                        <h3 className="service-feature-title">Investment Strategy</h3>
                        <p className="service-feature-text">Align each purchase with your timeline, return goals, and risk profile.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Data</div>
                        <h3 className="service-feature-title">Market Analysis</h3>
                        <p className="service-feature-text">Use stronger local data to spot opportunities before they become obvious.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Source</div>
                        <h3 className="service-feature-title">Property Sourcing</h3>
                        <p className="service-feature-text">Find opportunities that match your target area, price band, and objective.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Return</div>
                        <h3 className="service-feature-title">Financial Analysis</h3>
                        <p className="service-feature-text">Evaluate yield, resale potential, and pricing pressure with greater confidence.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Build</div>
                        <h3 className="service-feature-title">Development Potential</h3>
                        <p className="service-feature-text">Assess renovation and repositioning opportunities with practical realism.</p>
                    </div>

                    <div className="service-feature-card">
                        <div className="service-feature-icon">Scale</div>
                        <h3 className="service-feature-title">Portfolio Support</h3>
                        <p className="service-feature-text">Build a more balanced property portfolio with ongoing advisory support.</p>
                    </div>
                </div>

                <div className="service-section">
                    <h2 className="service-section-title">Investment paths we support</h2>
                    <div className="service-strategy-grid">
                        <div>
                            <h3 className="service-strategy-title">Buy and Hold</h3>
                            <p className="service-strategy-copy">Focus on long-term appreciation and steady rental demand in high-potential districts.</p>
                        </div>
                        <div>
                            <h3 className="service-strategy-title">Renovation Plays</h3>
                            <p className="service-strategy-copy">Identify undervalued assets that benefit from design-led improvements and repositioning.</p>
                        </div>
                        <div>
                            <h3 className="service-strategy-title">Multi-Unit Assets</h3>
                            <p className="service-strategy-copy">Assess buildings and mixed-use opportunities with stronger income potential.</p>
                        </div>
                        <div>
                            <h3 className="service-strategy-title">Commercial Real Estate</h3>
                            <p className="service-strategy-copy">Review commercial opportunities with attention to demand, location, and long-term utility.</p>
                        </div>
                    </div>
                </div>

                <div className="service-cta">
                    <h2 className="service-cta-title">Start your investment journey</h2>
                    <p className="service-cta-text">
                        Schedule a private consultation to review your goals and the opportunities that fit them best.
                    </p>
                    <div className="service-cta-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/contact')}>
                            Schedule Consultation
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('/listings')}>
                            View Properties
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InvestmentPage
