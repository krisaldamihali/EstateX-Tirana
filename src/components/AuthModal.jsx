import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const initialFormState = {
  name: '',
  email: '',
  password: '',
}

const AuthModal = () => {
  const [isSignIn, setIsSignIn] = useState(true)
  const [formData, setFormData] = useState(initialFormState)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('auth') // 'auth' or 'verify'
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const {
    signIn,
    signUp,
    verifyEmail,
    isAuthModalOpen,
    authModalMessage,
    closeAuthModal,
  } = useAuth()

  useEffect(() => {
    if (!isAuthModalOpen) {
      setIsSignIn(true)
      setFormData(initialFormState)
      setError('')
      setSubmitting(false)
      setStep('auth')
      setVerificationCode('')
    }
  }, [isAuthModalOpen])

  if (!isAuthModalOpen) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    if (step === 'verify') {
      const result = await verifyEmail(verificationEmail, verificationCode)
      setSubmitting(false)
      if (result.success) {
        closeAuthModal()
      } else {
        setError(result.error)
      }
      return
    }

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Ju lutem vendosni një email të saktë.')
      setSubmitting(false)
      return
    }

    let result

    if (isSignIn) {
      result = await signIn(formData.email, formData.password)
      if (!result.success && result.requiresVerification) {
        setStep('verify')
        setVerificationEmail(result.email)
        setSubmitting(false)
        return
      }
    } else {
      if (!formData.name.trim()) {
        setError('Ju lutem vendosni emrin tuaj')
        setSubmitting(false)
        return
      }
      
      // Password validation
      const hasUppercase = /[A-Z]/.test(formData.password)
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
      const isLongEnough = formData.password.length >= 8

      if (!isLongEnough || !hasUppercase || !hasSymbol) {
        setError('Fjalëkalimi duhet të ketë 8+ karaktere, një shkronjë të madhe dhe një simbol.')
        setSubmitting(false)
        return
      }

      result = await signUp(formData.name.trim(), formData.email, formData.password)
      if (result.success) {
        setStep('verify')
        setVerificationEmail(result.email)
        setSubmitting(false)
        return
      }
    }

    setSubmitting(false)

    if (result.success) {
      closeAuthModal()
      setFormData(initialFormState)
      return
    }

    setError(result.error || 'Diçka shkoi gabim. Ju lutem provoni përsëri.')
  }

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const toggleMode = () => {
    setIsSignIn((prev) => !prev)
    setError('')
    setFormData(initialFormState)
    setStep('auth')
  }

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
        <button className="auth-modal-close" onClick={closeAuthModal}>
            <i className="fa-solid fa-xmark"></i>
        </button>

        <h2 className="auth-modal-title">
          {step === 'verify' ? 'Verifikoni Email-in' : (isSignIn ? 'Mirësevini përsëri' : 'Bashkohuni me EstateX')}
        </h2>
        <p className="auth-modal-subtitle">
          {step === 'verify' 
            ? `Kemi dërguar një kod 6-shifror në ${verificationEmail}` 
            : (authModalMessage || (isSignIn ? 'Hyni në llogarinë tuaj' : 'Krijoni llogarinë tuaj sot'))}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 'verify' ? (
            <div className="form-group">
              <label className="form-label">Kodi i Verifikimit</label>
              <input
                type="text"
                className="form-input"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                placeholder="000000"
                maxLength="6"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
              />
            </div>
          ) : (
            <>
              {!isSignIn && (
                <div className="form-group">
                  <label className="form-label">Emri i Plotë</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isSignIn}
                    placeholder="Emër Mbiemër"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Adresa Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fjalëkalimi</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="********"
                  minLength="8"
                />
                {!isSignIn && (
                  <p className="password-hint">
                    Min. 8 karaktere, 1 shkronjë e madhe, 1 simbol
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', opacity: submitting ? 0.8 : 1 }}
            disabled={submitting}
          >
            {submitting
              ? (step === 'verify' ? 'Duke Verifikuar...' : (isSignIn ? 'Duke Hyrë...' : 'Duke Krijuar...'))
              : (step === 'verify' ? 'Verifiko' : (isSignIn ? 'Hyr' : 'Regjistrohu'))}
          </button>
        </form>

        <div className="auth-toggle">
          {step === 'verify' ? (
            <p>
              Nuk erdhi kodi?{' '}
              <span onClick={() => setStep('auth')} style={{ cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600 }}>
                Provo përsëri
              </span>
            </p>
          ) : (
            <p>
              {isSignIn ? "Nuk keni llogari? " : 'Keni llogari? '}
              <span onClick={toggleMode} style={{ cursor: 'pointer', color: 'var(--secondary)', fontWeight: 600 }}>
                {isSignIn ? 'Regjistrohu' : 'Hyr'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
