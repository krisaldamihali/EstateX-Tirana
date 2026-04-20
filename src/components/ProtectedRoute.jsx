import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({ children, title = "Exclusive Content", subtitle = "This feature is reserved for our registered members. Join our community to unlock premium property details and market tools." }) => {
    const { user, openAuthModal } = useAuth()
    const navigate = useNavigate()

    if (user) {
        return children
    }

    return (
        <div className="restricted-container">
            <div className="restricted-glass">
                <div className="restricted-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 className="restricted-title">{title}</h2>
                <p className="restricted-subtitle">{subtitle}</p>
                <div className="restricted-actions">
                    <button className="btn btn-primary" onClick={() => openAuthModal()}>
                        Sign In to Unlock
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        Return Home
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .restricted-container {
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: radial-gradient(circle at center, rgba(212, 165, 116, 0.05) 0%, transparent 70%);
                }
                .restricted-glass {
                    max-width: 500px;
                    width: 100%;
                    padding: 3rem;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(212, 165, 116, 0.2);
                    border-radius: 24px;
                    text-align: center;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
                    animation: restrictedScale 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes restrictedScale {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .restricted-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(212, 165, 116, 0.1);
                    color: var(--secondary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                }
                .restricted-icon svg {
                    width: 40px;
                    height: 40px;
                }
                .restricted-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.2rem;
                    color: var(--primary);
                    margin-bottom: 1rem;
                }
                .restricted-subtitle {
                    color: var(--text-light);
                    line-height: 1.6;
                    margin-bottom: 2.5rem;
                    font-size: 1.05rem;
                }
                .restricted-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .restricted-actions .btn {
                    width: 100%;
                    padding: 1.1rem;
                }
            `}} />
        </div>
    )
}

export default ProtectedRoute
