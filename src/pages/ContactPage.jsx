import { useState } from 'react'
import { submitContactForm } from '../services/api'

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        message: '',
        preferredContact: 'email'
    })
    const [focusedField, setFocusedField] = useState('')
    const [status, setStatus] = useState({ type: '', message: '' })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setStatus({ type: '', message: '' })

        try {
            const res = await submitContactForm({
                ...formData,
                subject: formData.propertyType ? `Inquiry about ${formData.propertyType}` : 'General Inquiry'
            })
            setStatus({ type: 'success', message: res.message })
            setFormData({
                name: '',
                email: '',
                phone: '',
                propertyType: '',
                message: '',
                preferredContact: 'email'
            })
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Something went wrong.' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <>
            <div style={{ height: '85px' }}></div>

            <div className="contact-split-container">
                <div className="contact-left-panel">
                    <div className="contact-left-content">
                        <span className="contact-eyebrow">Get in Touch</span>
                        <h1 className="contact-main-title">
                            Let&apos;s Shape Your<br />
                            Next Move
                        </h1>
                        <p className="contact-intro">
                            Whether you are buying, selling, or investing, EstateX Tirana offers a more thoughtful
                            and premium way to navigate the market.
                        </p>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="contact-method-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="contact-method-details">
                                    <div className="contact-method-label">Email</div>
                                    <div className="contact-method-value">hello@estatextirana.com</div>
                                    <div className="contact-method-note">Response within one business day</div>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-method-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="contact-method-details">
                                    <div className="contact-method-label">Phone</div>
                                    <div className="contact-method-value">+355 69 123 4567</div>
                                    <div className="contact-method-note">Monday to Saturday, 09:00 - 18:00</div>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-method-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="contact-method-details">
                                    <div className="contact-method-label">Office</div>
                                    <div className="contact-method-value">Tirana, Albania</div>
                                    <div className="contact-method-note">Private meetings by appointment</div>
                                </div>
                            </div>
                        </div>

                        <div className="office-hours">
                            <h3 className="office-hours-title">Office Hours</h3>
                            <div className="office-hours-list">
                                <div className="office-hours-row">
                                    <span>Monday - Friday</span>
                                    <span>9:00 AM - 6:00 PM</span>
                                </div>
                                <div className="office-hours-row">
                                    <span>Saturday</span>
                                    <span>10:00 AM - 3:00 PM</span>
                                </div>
                                <div className="office-hours-row">
                                    <span>Sunday</span>
                                    <span>By appointment</span>
                                </div>
                            </div>
                        </div>

                        <div className="social-links">
                            <a href="#" className="social-link">Instagram</a>
                            <span className="social-divider">/</span>
                            <a href="#" className="social-link">LinkedIn</a>
                            <span className="social-divider">/</span>
                            <a href="#" className="social-link">Facebook</a>
                        </div>
                    </div>
                </div>

                <div className="contact-right-panel">
                    <div className="contact-form-wrapper">
                        <h2 className="contact-form-title">Send us a message</h2>

                        {status.message && (
                            <div className={`contact-status-${status.type}`}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="contact-form-luxury">
                            <div className={`form-field ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'filled' : ''}`}>
                                <label className="form-field-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-field-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                />
                            </div>

                            <div className="form-field-row">
                                <div className={`form-field ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                                    <label className="form-field-label">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-field-input"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField('')}
                                        required
                                    />
                                </div>

                                <div className={`form-field ${focusedField === 'phone' ? 'focused' : ''} ${formData.phone ? 'filled' : ''}`}>
                                    <label className="form-field-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-field-input"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField('')}
                                    />
                                </div>
                            </div>

                            <div className={`form-field ${focusedField === 'propertyType' ? 'focused' : ''} ${formData.propertyType ? 'filled' : ''}`}>
                                <label className="form-field-label">I am interested in</label>
                                <select
                                    name="propertyType"
                                    className="form-field-input"
                                    value={formData.propertyType}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('propertyType')}
                                    onBlur={() => setFocusedField('')}
                                >
                                    <option value="">Select an option</option>
                                    <option value="buying">Buying a Property</option>
                                    <option value="selling">Selling a Property</option>
                                    <option value="investment">Investment Opportunities</option>
                                    <option value="consultation">Schedule a Consultation</option>
                                    <option value="valuation">Property Valuation</option>
                                    <option value="other">Other Inquiry</option>
                                </select>
                            </div>

                            <div className={`form-field ${focusedField === 'message' ? 'focused' : ''} ${formData.message ? 'filled' : ''}`}>
                                <label className="form-field-label">Message *</label>
                                <textarea
                                    name="message"
                                    className="form-field-textarea"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('message')}
                                    onBlur={() => setFocusedField('')}
                                    required
                                    rows="5"
                                />
                            </div>

                            <div className="form-field-radio-group">
                                <label className="form-field-label">Preferred Contact Method</label>
                                <div className="radio-options">
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="preferredContact"
                                            value="email"
                                            checked={formData.preferredContact === 'email'}
                                            onChange={handleChange}
                                        />
                                        <span className="radio-label">Email</span>
                                    </label>
                                    <label className="radio-option">
                                        <input
                                            type="radio"
                                            name="preferredContact"
                                            value="phone"
                                            checked={formData.preferredContact === 'phone'}
                                            onChange={handleChange}
                                        />
                                        <span className="radio-label">Phone</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-luxury">
                                <span>Send Message</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>

                            <p className="form-privacy-note">
                                By submitting this form, you agree to our privacy policy. We handle your information with care and discretion.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContactPage
