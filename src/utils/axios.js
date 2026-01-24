import axios from 'axios'
import Cookies from 'vue-cookies'
import URL from '@/assets/configurations/BASE_URL.js'
import router from '@/router'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: URL.BASE_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors and refresh token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const currentToken = Cookies.get('token')
      
      if (!currentToken) {
        // No token, logout
        handleLogout()
        return Promise.reject(error)
      }

      try {
        // Try to refresh token - JWT Auth sử dụng cùng token để refresh
        const response = await axios.post(`${URL.BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Access-Control-Allow-Origin': '*'
          }
        })

        const newToken = response.data.data.access_token

        // Save new token
        Cookies.set('token', newToken)

        // Update authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // Process queued requests
        processQueue(null, newToken)

        isRefreshing = false

        // Retry original request
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError, null)
        isRefreshing = false
        handleLogout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

const handleLogout = () => {
  // Clear tokens
  Cookies.remove('token')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_info')
  
  // Redirect to login
  if (router.currentRoute.path !== '/login') {
    router.push('/login')
  }
}

export default axiosInstance
