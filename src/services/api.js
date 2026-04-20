/**
 * API service for the Flask backend.
 * Authenticated requests use the same session cookie backed by SQLite users.
 */

const API_BASE = '/api'

async function request(path, options = {}) {
  const config = {
    credentials: 'include',
    headers: {},
    ...options,
  }

  if (config.body && !(config.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
    config.body = JSON.stringify(config.body)
  }

  const res = await fetch(`${API_BASE}${path}`, config)
  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json()
    : null

  if (!res.ok) {
    const error = new Error(data?.error || 'Request failed')
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export async function fetchProperties(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      params.append(key, value)
    }
  })

  const query = params.toString()
  return request(`/properties${query ? `?${query}` : ''}`)
}

export async function fetchProperty(id) {
  return request(`/properties/${id}`)
}

export async function fetchEstimate(data) {
  return request('/estimate', {
    method: 'POST',
    body: data,
  })
}

export async function fetchNeighborhoods() {
  return request('/neighborhoods')
}

export async function fetchMarketInsights() {
  return request('/market-insights')
}

export async function fetchMapPoints() {
  return request('/map-points')
}

export async function fetchSessionUser() {
  return request('/auth/me')
}

export async function signInUser(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

export async function signUpUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export async function signOutUser() {
  return request('/auth/logout', {
    method: 'POST',
  })
}

export async function fetchUserPreferences() {
  return request('/account/preferences')
}

export async function toggleFavoriteRequest(propertyId) {
  return request('/account/favorites/toggle', {
    method: 'POST',
    body: { propertyId },
  })
}

export async function submitContactForm(data) {
  return request('/contact', {
    method: 'POST',
    body: data,
  })
}

export async function toggleCompareRequest(propertyId) {
  return request('/account/compare/toggle', {
    method: 'POST',
    body: { propertyId },
  })
}

export async function clearCompareRequest() {
  return request('/account/compare', {
    method: 'DELETE',
  })
}

export async function verifyUserEmail(payload) {
  return request('/auth/verify', {
    method: 'POST',
    body: payload,
  })
}
