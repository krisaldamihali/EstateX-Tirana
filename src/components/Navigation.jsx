import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import AuthModal from './AuthModal'

const Navigation = () => {
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, signOut, openAuthModal } = useAuth()
    const { favorites } = useFavorites()

    const handleSignOut = async () => {
        await signOut()
        setShowUserMenu(false)
        setIsMobileMenuOpen(false)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

    return (
        <>
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="logo" onClick={closeMobileMenu}>
                        <img src="/logo.png" alt="EstateX Tirana" className="logo-img" />
                    </Link>

                    <ul className="nav-links">
                        <li>
                            <NavLink to="/" className={navLinkClass}>
                                Home
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/listings" className={navLinkClass}>
                                Properties
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/favorites"
                                className={({ isActive }) => `nav-link nav-favorites-link${isActive ? ' active' : ''}`}
                            >
                                Favorites
                                {favorites.length > 0 && (
                                    <span className="nav-favorites-badge">{favorites.length}</span>
                                )}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/contact" className={navLinkClass}>
                                Contact
                            </NavLink>
                        </li>
                    </ul>

                    <div className="nav-auth">
                        {user ? (
                            <div className="user-menu-container">
                                <button
                                    className="user-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name">{user.name}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <div className="user-dropdown-header">
                                            <p className="user-dropdown-name">{user.name}</p>
                                            <p className="user-dropdown-email">{user.email}</p>
                                        </div>
                                        <div className="user-dropdown-divider"></div>
                                        <Link to="/favorites" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                                            Favorites
                                        </Link>
                                        <Link to="/compare" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>
                                            Compare
                                        </Link>
                                        <div className="user-dropdown-divider"></div>
                                        <button
                                            className="user-dropdown-item user-dropdown-signout"
                                            onClick={handleSignOut}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className="btn btn-primary btn-nav"
                                onClick={() => openAuthModal()}
                            >
                                Sign In
                            </button>
                        )}

                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="mobile-menu open">
                        <div className="mobile-menu-content">
                            <Link to="/" onClick={closeMobileMenu} className="mobile-menu-item">Home</Link>
                            <Link to="/listings" onClick={closeMobileMenu} className="mobile-menu-item">Properties</Link>
                            <Link to="/favorites" onClick={closeMobileMenu} className="mobile-menu-item">
                                Favorites {favorites.length > 0 && `(${favorites.length})`}
                            </Link>
                            <Link to="/compare" onClick={closeMobileMenu} className="mobile-menu-item">Compare</Link>
                            <Link to="/contact" onClick={closeMobileMenu} className="mobile-menu-item">Contact</Link>

                            {!user && (
                                <>
                                    <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.1)', margin: '1rem 0' }} />
                                    <button
                                        onClick={() => { openAuthModal(); closeMobileMenu() }}
                                        className="mobile-menu-item"
                                        style={{ background: 'var(--primary)', color: 'white', textAlign: 'center', fontWeight: '600' }}
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}

                            {user && (
                                <>
                                    <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.1)', margin: '1rem 0' }} />
                                    <div style={{ padding: '1rem', background: 'rgba(212, 165, 116, 0.1)', borderRadius: '6px' }}>
                                        <p style={{ fontWeight: '600', marginBottom: '0.3rem', color: 'var(--text-dark)' }}>{user.name}</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="mobile-menu-item"
                                        style={{ color: '#d32f2f', border: '2px solid #d32f2f', textAlign: 'center', fontWeight: '600' }}
                                    >
                                        Sign Out
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <AuthModal />
        </>
    )
}

export default Navigation
