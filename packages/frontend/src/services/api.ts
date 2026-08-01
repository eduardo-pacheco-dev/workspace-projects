import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthEndpoint = authEndpoints.some((endpoint) => url.startsWith(endpoint))
      if (!isAuthEndpoint) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/signin') {
          window.location.href = '/signin'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
