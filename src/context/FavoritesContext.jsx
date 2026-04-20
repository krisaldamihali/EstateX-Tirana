import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  clearCompareRequest,
  fetchUserPreferences,
  toggleCompareRequest,
  toggleFavoriteRequest,
} from '../services/api'
import { useAuth } from './AuthContext'
import NotificationModal from '../components/NotificationModal'

const FavoritesContext = createContext()

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }) => {
  const { user, loading: authLoading, openAuthModal } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [compareList, setCompareList] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ isOpen: false, message: '', title: '' })

  const showNotification = useCallback((message, title = "Notice") => {
    setNotification({ isOpen: true, message, title })
  }, [])

  useEffect(() => {
    let active = true

    const syncPreferences = async () => {
      if (authLoading) {
        return
      }

      if (!user) {
        if (active) {
          setFavorites([])
          setCompareList([])
          setLoading(false)
        }
        return
      }

      if (active) {
        setLoading(true)
      }

      try {
        const data = await fetchUserPreferences()
        if (active) {
          setFavorites(data.favorites || [])
          setCompareList(data.compareList || [])
        }
      } catch (error) {
        console.error('Failed to load saved properties', error)
        if (active) {
          setFavorites([])
          setCompareList([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    syncPreferences()

    return () => {
      active = false
    }
  }, [user, authLoading])

  const requireUser = useCallback((message) => {
    if (!user) {
      openAuthModal(message)
      return false
    }
    return true
  }, [user, openAuthModal])

  const toggleFavorite = useCallback(async (property) => {
    if (!requireUser('Sign in to save properties to Favorites.')) {
      return { success: false, requiresAuth: true }
    }

    try {
      const data = await toggleFavoriteRequest(property.id)
      setFavorites(data.favorites || [])
      return { success: true, saved: !!data.saved }
    } catch (error) {
      if (error.status === 401) {
        openAuthModal(error.message || 'Please sign in to continue.')
      } else {
        console.error('Failed to update favorites', error)
      }
      return { success: false, error: error.message }
    }
  }, [requireUser, openAuthModal])

  const isFavorite = useCallback((id) => favorites.some((property) => property.id === id), [favorites])

  const toggleCompare = useCallback(async (property) => {
    const exists = compareList.some((item) => item.id === property.id)
    if (!exists && compareList.length >= 4) {
      return { success: false, error: 'You can compare up to 4 properties at a time.' }
    }

    if (!requireUser('Sign in to add properties to Compare.')) {
      return { success: false, requiresAuth: true }
    }

    try {
      const data = await toggleCompareRequest(property.id)
      setCompareList(data.compareList || [])
      return { success: true, added: !!data.added }
    } catch (error) {
      if (error.status === 401) {
        openAuthModal(error.message || 'Please sign in to continue.')
      } else {
        console.error('Failed to update compare list', error)
      }
      return { success: false, error: error.message }
    }
  }, [compareList, requireUser, openAuthModal])

  const isInCompare = useCallback((id) => compareList.some((property) => property.id === id), [compareList])

  const clearCompare = useCallback(async () => {
    if (!requireUser('Sign in to manage your Compare list.')) {
      return { success: false, requiresAuth: true }
    }

    try {
      const data = await clearCompareRequest()
      setCompareList(data.compareList || [])
      return { success: true }
    } catch (error) {
      if (error.status === 401) {
        openAuthModal(error.message || 'Please sign in to continue.')
      } else {
        console.error('Failed to clear compare list', error)
      }
      return { success: false, error: error.message }
    }
  }, [requireUser, openAuthModal])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        compareList,
        loading: authLoading || loading,
        toggleFavorite,
        isFavorite,
        toggleCompare,
        isInCompare,
        clearCompare,
        showNotification
      }}
    >
      {children}
      <NotificationModal 
        isOpen={notification.isOpen} 
        onClose={() => setNotification({ ...notification, isOpen: false })} 
        message={notification.message} 
        title={notification.title} 
      />
    </FavoritesContext.Provider>
  )
}
