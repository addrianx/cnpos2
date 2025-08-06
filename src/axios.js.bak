// src/axios.js
import axios from 'axios'
import router from './router'

const api = axios.create({
  baseURL: 'http://localhost/login_api_lumen/public/api', // Sesuaikan dengan base URL API kamu
})

// Tambahkan token ke setiap request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Tangani error token expired (401)
api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      isRefreshing = true
      const refreshToken = localStorage.getItem('refresh_token')

      return new Promise((resolve, reject) => {
        axios
          .post('http://localhost/login_api_lumen/public/api/refresh', {
            refresh_token: refreshToken
          })
          .then(({ data }) => {
            localStorage.setItem('token', data.token)
            localStorage.setItem('refresh_token', data.refresh_token)

            api.defaults.headers.common.Authorization = 'Bearer ' + data.token
            originalRequest.headers.Authorization = 'Bearer ' + data.token

            processQueue(null, data.token)
            resolve(api(originalRequest))
          })
          .catch(err => {
            processQueue(err, null)
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            router.push('/login')
            reject(err)
          })
          .finally(() => {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  }
)

export default api
