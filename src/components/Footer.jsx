import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <img src="/logo.png" alt="EstateX Tirana" className="footer-logo" />
                    <p className="footer-copy">
                        Premium real estate experiences in Tirana, crafted with clarity, trust, and elevated presentation.
                    </p>
                </div>

                <div className="footer-links">
                    <Link to="/listings" className="footer-link">Properties</Link>
                    <Link to="/contact" className="footer-link">Contact</Link>
                    <Link to="/favorites" className="footer-link">Favorites</Link>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2026 EstateX Tirana. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer
