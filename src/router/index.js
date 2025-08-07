import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import jwt_decode from 'jwt-decode'
import axios from 'axios'

NProgress.configure({ showSpinner: false })

// ========================
// FUNGSI PENDUKUNG
// ========================
const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token)
    return decoded.exp < Date.now() / 1000
  } catch {
    return true
  }
}

const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(
      'http://localhost/login_api_lumen/public/api/auth/refresh',
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Pastikan key sesuai dengan response backend
    const accessToken = response.data.token || response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    if (!accessToken) {
      throw new Error('Invalid token response');
    }

    // Update storage
    localStorage.setItem('token', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    console.error('Refresh failed:', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

// Import component yang langsung (non-lazy)
import DashboardView from '../views/DashboardView.vue'
import TambahProduk from '../views/products/TambahProduk.vue'
import DaftarProduk from '../views/products/DaftarProduk.vue'
import EditProduk from '../views/products/EditProduk.vue'
import KategoriProduk from '../views/products/KategoriProduk.vue'
import StockProduk from '@/views/products/StockProduk.vue'
import TambahStok from '@/views/products/TambahStok.vue'
import EditStok from '@/views/products/EditStok.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('../views/Login.vue'),
    meta: { layout: 'blank' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/tambah-produk',
    name: 'Tambah Produk',
    component: TambahProduk,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/daftar-produk',
    name: 'Daftar Produk',
    component: DaftarProduk,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/edit-produk/:id',
    name: 'Edit Produk',
    component: EditProduk,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/kategori-produk',
    name: 'Kategori Produk',
    component: KategoriProduk,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/stok-produk',
    name: 'Stok Produk',
    component: StockProduk,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/tambah-stok',
    name: 'Tambah Stok',
    component: TambahStok,
    meta: { layout: 'app', requiresAuth: true }
  },
  {
    path: '/dashboard/edit-stok/:id',
    name: 'Edit Stok',
    component: EditStok,
    meta: { layout: 'app', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const token = localStorage.getItem('token');
  const requiresAuth = to.meta.requiresAuth;

  // 1. Public routes
  if (!requiresAuth) {
    if (to.name === 'LoginPage' && token) {
      next({ name: 'Dashboard' });
    } else {
      next();
    }
    NProgress.done();
    return;
  }

  // 2. Protected routes
  if (token) {
    if (!isTokenExpired(token)) {
      next();
      NProgress.done();
      return;
    }

    try {
      await refreshAuthToken(); // Tidak perlu simpan ke variabel
      next();
    } catch (error) {
      // Error sudah dihandle oleh axios interceptor
      return;
    } finally {
      NProgress.done();
    }
    return;
  }

  // 3. No token at all
  next({
    name: 'LoginPage',
    query: {
      forced: 'true',
      redirect: to.fullPath
    }
  });
  NProgress.done();
});

export default router
