import { createContext, useContext, useEffect, useState } from 'react'
import {
  fetchSessionUser,
  signInUser,
  signOutUser,
  signUpUser,
} from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMessage, setAuthModalMessage] = useState('')

  useEffect(() => {
    // Session restoration disabled for "manual login" requirement
    setLoading(false)
  }, [])

  const openAuthModal = (message = '') => {
    setAuthModalMessage(message)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthModalMessage('')
  }

  const signIn = async (email, password) => {
    try {
      const data = await signInUser({ email, password })
      setUser(data.user || null)
      return { success: true }
    } catch (error) {
      if (error.data && error.data.requires_verification) {
        return { success: false, requiresVerification: true, email: error.data.email }
      }
      return { success: false, error: error.message || 'Failed to sign in.' }
    }
  }

  const signUp = async (name, email, password) => {
    try {
      const data = await signUpUser({ name, email, password })
      // No longer sets user here, as verification is needed
      return { success: true, message: data.message, email: data.email }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to create account.' }
    }
  }

  const verifyEmail = async (email, code) => {
    try {
      const { verifyUserEmail } = await import('../services/api')
      const data = await verifyUserEmail({ email, code })
      setUser(data.user || null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Invalid verification code.' }
    }
  }

  const signOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Failed to sign out cleanly', error)
    } finally {
      setUser(null)
      closeAuthModal()
    }
  }

  const value = {
    user,
    loading,
    isAuthModalOpen,
    authModalMessage,
    openAuthModal,
    closeAuthModal,
    signIn,
    signUp,
    verifyEmail,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
