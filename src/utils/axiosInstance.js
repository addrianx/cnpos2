// src/utils/axiosInstance.js
import axios from 'axios'

const baseURL = 'http://localhost/login_api_lumen/public/api'

const axiosInstance = axios.create({
  baseURL
})

// Interceptor untuk response error
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')

      try {
        const res = await axios.post(`${baseURL}/refresh-token`, {
          refresh_token: refreshToken
        })

        const newToken = res.data.token
        localStorage.setItem('token', newToken)

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return axiosInstance(originalRequest)

      } catch (refreshError) {
        // Jika refresh gagal, redirect ke login
        console.error('Refresh token gagal:', refreshError)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default axiosInstance
