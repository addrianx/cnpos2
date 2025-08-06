<template>
      <nav class="sidebar sidebar-offcanvas" id="sidebar">
        <ul class="nav">
          <!-- Dashboard -->
        <li class="nav-item">
          <router-link class="nav-link" to="/dashboard">
            <i class="icon-grid menu-icon"></i>
            <span class="menu-title">Dashboard</span>
          </router-link>
        </li>
        <!-- Produk -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'produk' }">
          <a class="nav-link" href="#" 
            @click.prevent="toggleDropdown('produk')" 
            :class="{ active: isActive('produk') }">
            <i class="icon-layout menu-icon"></i>
            <span class="menu-title">Produk</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'produk' }" id="produk">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <router-link to="/dashboard/daftar-produk" class="nav-link" exact-active-class="active">Daftar</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/dashboard/tambah-produk" class="nav-link" exact-active-class="active">Tambah</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/dashboard/kategori-produk" class="nav-link" exact-active-class="active">Kategori</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/dashboard/stok-produk" class="nav-link" exact-active-class="active">Stok</router-link>
              </li>
            </ul>
          </div>
        </li>

        <!-- Form elements -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'form-elements' }">
          <a class="nav-link"
            href="#"
            @click.prevent="toggleDropdown('form-elements')"
            :class="{ active: isActive('form-elements') }">
            <i class="icon-columns menu-icon"></i>
            <span class="menu-title">Form elements</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'form-elements' }" id="form-elements">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <a class="nav-link" href="../../pages/forms/basic_elements.html">Basic Elements</a>
              </li>
            </ul>
          </div>
        </li>

        <!-- Charts -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'charts' }">
          <a class="nav-link" href="#" @click.prevent="toggleDropdown('charts')">
            <i class="icon-bar-graph menu-icon"></i>
            <span class="menu-title">Charts</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'charts' }" id="charts">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <a class="nav-link" href="../../pages/charts/chartjs.html">ChartJs</a>
              </li>
            </ul>
          </div>
        </li>

        <!-- Tables -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'tables' }">
          <a class="nav-link" href="#" @click.prevent="toggleDropdown('tables')">
            <i class="icon-grid-2 menu-icon"></i>
            <span class="menu-title">Tables</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'tables' }" id="tables">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <a class="nav-link" href="../../pages/tables/basic-table.html">Basic table</a>
              </li>
            </ul>
          </div>
        </li>

        <!-- Icons -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'icons' }">
          <a class="nav-link" href="#" @click.prevent="toggleDropdown('icons')">
            <i class="icon-contract menu-icon"></i>
            <span class="menu-title">Icons</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'icons' }" id="icons">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <a class="nav-link" href="../../pages/icons/mdi.html">Mdi icons</a>
              </li>
            </ul>
          </div>
        </li>

        <!-- Auth -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'auth' }">
          <a class="nav-link" href="#" @click.prevent="toggleDropdown('auth')">
            <i class="icon-head menu-icon"></i>
            <span class="menu-title">User Pages</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'auth' }" id="auth">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <a class="nav-link" href="../../pages/samples/login.html">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="../../pages/samples/register.html">Register</a>
              </li>
            </ul>
          </div>
        </li>

        <!-- Error -->
        <li class="nav-item" :class="{ 'menu-open': activeDropdown === 'error' }">
          <a class="nav-link" href="#" @click.prevent="toggleDropdown('error')">
            <i class="icon-ban menu-icon"></i>
            <span class="menu-title">Error pages</span>
            <i class="menu-arrow"></i>
          </a>
          <div class="collapse" :class="{ show: activeDropdown === 'error' }" id="error">
            <ul class="nav flex-column sub-menu">
              <li class="nav-item">
                <a class="nav-link" href="../../pages/samples/error-404.html">404</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="../../pages/samples/error-500.html">500</a>
              </li>
            </ul>
          </div>
        </li>

        </ul>
      </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, watch } from 'vue'; // ✅ import ref ditambahkan

const route = useRoute();

// Reusable checker function
// const isMenuActive = (paths, exact = false) => {
//   return computed(() =>
//     paths.some((p) => exact ? route.path === p : route.path.startsWith(p))
//   );
// };

// ✅ Jika belum digunakan di template, lebih baik di-comment dulu
// const isDashboardActive = isMenuActive(['/dashboard'], true);
// const manajemenProdukRoutes = [
//   '/dashboard/daftar-produk',
//   '/dashboard/tambah-produk',
//   '/dashboard/kategori-produk'
// ];
// const isManajemenProdukActive = isMenuActive(manajemenProdukRoutes);

// Fix Dropdown
const activeDropdown = ref('');

// Aktifkan dropdown berdasarkan route
const setInitialDropdown = () => {
  const path = route.path;
  if (path.startsWith('/dashboard/daftar-produk') || path.startsWith('/dashboard/tambah-produk') || path.startsWith('/dashboard/kategori-produk')) {
    activeDropdown.value = 'produk';
  } else if (path.includes('/forms')) {
    activeDropdown.value = 'form-elements';
  } else if (path.includes('/charts')) {
    activeDropdown.value = 'charts';
  } else if (path.includes('/tables')) {
    activeDropdown.value = 'tables';
  } else if (path.includes('/icons')) {
    activeDropdown.value = 'icons';
  } else if (path.includes('/samples')) {
    activeDropdown.value = 'auth';
  } else if (path.includes('/error')) {
    activeDropdown.value = 'error';
  } else {
    activeDropdown.value = ''; // default none
  }
};

function isActive(dropdown) {
  switch (dropdown) {
    case 'produk':
      return [
        '/dashboard/daftar-produk',
        '/dashboard/tambah-produk',
        '/dashboard/kategori-produk',
      ].includes(route.path);
    case 'form-elements':
      return route.path.includes('/forms');
    case 'charts':
      return route.path.includes('/charts');
    case 'tables':
      return route.path.includes('/tables');
    case 'icons':
      return route.path.includes('/icons');
    case 'auth':
      return route.path.includes('/samples');
    case 'error':
      return route.path.includes('/error');
    default:
      return false;
  }
}

// Jalankan saat pertama kali
setInitialDropdown();

// Pantau perubahan route, dan update active dropdown
watch(() => route.path, () => {
  setInitialDropdown();
});

// Toggle fungsi buka tutup dropdown
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? '' : dropdown;
};
</script>

