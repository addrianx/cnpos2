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
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="collapse" href="#produk" aria-expanded="false" aria-controls="produk">
          <i class="icon-layout menu-icon"></i>
          <span class="menu-title">Produk</span>
          <i class="menu-arrow"></i>
        </a>
        <div class="collapse" id="produk">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <router-link to="/dashboard/daftar-produk" class="nav-link">Daftar</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/tambah-produk" class="nav-link">Tambah</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/kategori-produk" class="nav-link">Kategori</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/dashboard/stok-produk" class="nav-link">Stok</router-link>
            </li>
          </ul>
        </div>
      </li>

      <!-- Form elements -->
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="collapse" href="#transaksi" aria-expanded="false" aria-controls="transaksi">
          <i class="icon-columns menu-icon"></i>
          <span class="menu-title">Transaksi</span>
          <i class="menu-arrow"></i>
        </a>
        <div class="collapse" id="transaksi">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/forms/basic_elements.html">Transaksi Baru</a>
            </li>
          </ul>
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/forms/basic_elements.html">Daftar Transaksi</a>
            </li>
          </ul>
        </div>
      </li>

      <!-- Charts -->
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="collapse" href="#pelanggan" aria-expanded="false" aria-controls="pelanggan">
          <i class="icon-bar-graph menu-icon"></i>
          <span class="menu-title">Data Pelanggan</span>
          <i class="menu-arrow"></i>
        </a>
        <div class="collapse" id="pelanggan">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/charts/chartjs.html">Daftar Data</a>
            </li>
          </ul>
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/charts/chartjs.html">Tambah Data</a>
            </li>
          </ul>
        </div>
      </li>

      <!-- Tables -->
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="collapse" href="#servis" aria-expanded="false" aria-controls="servis">
          <i class="icon-grid-2 menu-icon"></i>
          <span class="menu-title">Data Servis</span>
          <i class="menu-arrow"></i>
        </a>
        <div class="collapse" id="servis">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/tables/basic-table.html">Daftar Servis</a>
            </li>
          </ul>
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/tables/basic-table.html">Tambah Servis</a>
            </li>
          </ul>
        </div>
      </li>

      <!-- Icons -->
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="collapse" href="#icons" aria-expanded="false" aria-controls="icons">
          <i class="icon-contract menu-icon"></i>
          <span class="menu-title">Icons</span>
          <i class="menu-arrow"></i>
        </a>
        <div class="collapse" id="icons">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/icons/mdi.html">Mdi icons</a>
            </li>
          </ul>
        </div>
      </li>

    </ul>
  </nav>
</template>

<script setup>


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
// const activeDropdown = ref('');

// Aktifkan dropdown berdasarkan route
// const setInitialDropdown = () => {
//   const path = route.path;
//   if (path.startsWith('/dashboard/daftar-produk') || path.startsWith('/dashboard/tambah-produk') || path.startsWith('/dashboard/kategori-produk')) {
//     activeDropdown.value = 'produk';
//   } else if (path.includes('/forms')) {
//     activeDropdown.value = 'form-elements';
//   } else if (path.includes('/charts')) {
//     activeDropdown.value = 'charts';
//   } else if (path.includes('/tables')) {
//     activeDropdown.value = 'tables';
//   } else if (path.includes('/icons')) {
//     activeDropdown.value = 'icons';
//   } else if (path.includes('/samples')) {
//     activeDropdown.value = 'auth';
//   } else if (path.includes('/error')) {
//     activeDropdown.value = 'error';
//   } else {
//     activeDropdown.value = ''; // default none
//   }
// };


// Jalankan saat pertama kali
// setInitialDropdown();

// Pantau perubahan route, dan update active dropdown


// Toggle fungsi buka tutup dropdown
// const toggleDropdown = (dropdown) => {
//   activeDropdown.value = activeDropdown.value === dropdown ? '' : dropdown;
// };
</script>

