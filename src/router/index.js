import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Import component yang langsung (non-lazy)
import DashboardView from '../views/DashboardView.vue'
import TambahProduk from '../views/products/TambahProduk.vue'
import DaftarProduk from '../views/products/DaftarProduk.vue'
import EditProduk from '../views/products/EditProduk.vue'
import KategoriProduk from '../views/products/KategoriProduk.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

NProgress.configure({ showSpinner: false })

router.beforeEach((to, from, next) => {
  NProgress.start()

  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'LoginPage', query: { forced: 'true' } })
  } else if (to.name === 'LoginPage' && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
