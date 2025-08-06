// src/utils/axiosInstance.js
import axios from 'axios'
import router from '@/router'

const baseURL = 'http://localhost/login_api_lumen/public/api'
const axiosInstance = axios.create({ baseURL })

// Interceptor request
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token') // Sesuai dengan key yang digunakan backend
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// Interceptor response
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null, refreshToken = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve({ token, refreshToken })
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Abaikan jika bukan error 401 atau sudah di-retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle concurrent requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');

      const { data } = await axios.post(
        `${baseURL}/auth/refresh`, // Pastikan path benar
        { refresh_token: refreshToken }
      );

      const newAccessToken = data.token || data.access_token;
      const newRefreshToken = data.refresh_token;

      if (!newAccessToken) {
        throw new Error('Invalid token response');
      }

      // Update storage dan header
      localStorage.setItem('token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      // Proses request yang tertahan
      processQueue(null, newAccessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      // Redirect ke login
      window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance