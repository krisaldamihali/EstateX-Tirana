import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import ContactPage from './pages/ContactPage'
import PropertyDetail from './pages/PropertyDetail'
import BuyPropertyPage from './pages/BuyPropertyPage'
import SellPropertyPage from './pages/SellPropertyPage'
import ValuationPage from './pages/ValuationPage'
import InvestmentPage from './pages/InvestmentPage'
import FavoritesPage from './pages/FavoritesPage'
import ComparePage from './pages/ComparePage'
import ProtectedRoute from './components/ProtectedRoute'
import CrystalParticles from './components/CrystalParticles'
import './AntigravityFix.css'

function App() {
  useEffect(() => {
    const handleMouseMove = (event) => {
      document.documentElement.style.setProperty('--ag-cursor-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--ag-cursor-y', `${event.clientY}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <AuthProvider>
      <FavoritesProvider>
        <div className="app-shell">
          <CrystalParticles />
          <div className="ag-blobs-container" aria-hidden="true">
            <div className="ag-blob ag-blob-1"></div>
            <div className="ag-blob ag-blob-2"></div>
            <div className="ag-blob ag-blob-3"></div>
          </div>
          <div className="ag-noise" aria-hidden="true"></div>
          <div className="ag-cursor-glow" aria-hidden="true"></div>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={
              <ProtectedRoute title="Property Listings" subtitle="Access thousands of active property listings in Tirana. Join EstateX to find your perfect home.">
                <ListingsPage />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute title="Your Favorites" subtitle="Keep track of the properties you love. Sign in to sync your favorite listings across all your devices.">
                <FavoritesPage />
              </ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute title="Compare Properties" subtitle="Make informed decisions by comparing up to 4 properties side-by-side with our advanced comparison tool.">
                <ComparePage />
              </ProtectedRoute>
            } />
            <Route path="/contact" element={
              <ProtectedRoute title="Contact an Advisor" subtitle="Our real estate experts are here to guide you. Sign in to send inquiries and book viewings.">
                <ContactPage />
              </ProtectedRoute>
            } />
            <Route path="/property/:id" element={
              <ProtectedRoute title="Property Details" subtitle="Unlock high-resolution galleries, full descriptions, and AI-powered market valuations for this property.">
                <PropertyDetail />
              </ProtectedRoute>
            } />
            <Route path="/services/buy" element={<BuyPropertyPage />} />
            <Route path="/services/sell" element={<SellPropertyPage />} />
            <Route path="/services/valuation" element={<ValuationPage />} />
            <Route path="/services/investment" element={<InvestmentPage />} />
          </Routes>
          <Footer />
        </div>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App
