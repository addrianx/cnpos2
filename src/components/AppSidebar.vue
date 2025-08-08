<template>
  <nav class="sidebar sidebar-offcanvas" id="sidebar">
    <ul class="nav">

      <!-- Dashboard -->
      <li class="nav-item" :class="{ active: route.path === '/dashboard' }">
        <router-link to="/dashboard" class="nav-link">
          <i class="icon-grid menu-icon"></i>
          <span class="menu-title">Dashboard</span>
        </router-link>
      </li>

      <!-- Produk -->
      <li class="nav-item">
        <a
          class="nav-link"
          data-bs-toggle="collapse"
          href="#produk"
          :aria-expanded="isProdukActive"
          aria-controls="produk"
        >
          <i class="icon-layout menu-icon"></i>
          <span class="menu-title">Produk</span>
          <i class="menu-arrow"></i>
        </a>
        <div :class="['collapse', { show: isProdukActive }]" id="produk">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <router-link
                to="/dashboard/daftar-produk"
                class="nav-link"
                :class="{ active: route.path === '/dashboard/daftar-produk' }"
              >Daftar</router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/dashboard/tambah-produk"
                class="nav-link"
                :class="{ active: route.path === '/dashboard/tambah-produk' }"
              >Tambah</router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/dashboard/kategori-produk"
                class="nav-link"
                :class="{ active: route.path === '/dashboard/kategori-produk' }"
              >Kategori</router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/dashboard/stok-produk"
                class="nav-link"
                :class="{ active: route.path === '/dashboard/stok-produk' }"
              >Stok</router-link>
            </li>
          </ul>
        </div>
      </li>

      <!-- Transaksi -->
      <li class="nav-item">
        <a
          class="nav-link"
          data-bs-toggle="collapse"
          href="#transaksi"
          :aria-expanded="isTransaksiActive"
          aria-controls="transaksi"
        >
          <i class="icon-columns menu-icon"></i>
          <span class="menu-title">Transaksi</span>
          <i class="menu-arrow"></i>
        </a>
        <div :class="['collapse', { show: isTransaksiActive }]" id="transaksi">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <!-- Kalau pake Vue Router, ganti ke router-link -->
              <a class="nav-link" href="../../pages/forms/basic_elements.html">
                Transaksi Baru
              </a>
            </li>
          </ul>
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/forms/basic_elements.html">
                Daftar Transaksi
              </a>
            </li>
          </ul>
        </div>
      </li>

      <!-- Data Pelanggan -->
      <li class="nav-item">
        <a
          class="nav-link"
          data-bs-toggle="collapse"
          href="#pelanggan"
          :aria-expanded="isPelangganActive"
          aria-controls="pelanggan"
        >
          <i class="icon-bar-graph menu-icon"></i>
          <span class="menu-title">Data Pelanggan</span>
          <i class="menu-arrow"></i>
        </a>
        <div :class="['collapse', { show: isPelangganActive }]" id="pelanggan">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <router-link
                to="/dashboard/daftar-customer"
                class="nav-link"
                :class="{ active: route.path === '/dashboard/daftar-customer' }"
              >
                Daftar Customer
              </router-link>
            </li>
          </ul>
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <router-link
                to="/dashboard/add-customer"
                class="nav-link"
                :class="{ active: route.path === '/dashboard/add-customer' }"
              >
                Tambah Customer
              </router-link>
            </li>
          </ul>
        </div>
      </li>

      <!-- Data Servis -->
      <li class="nav-item">
        <a
          class="nav-link"
          data-bs-toggle="collapse"
          href="#servis"
          :aria-expanded="isServisActive"
          aria-controls="servis"
        >
          <i class="icon-grid-2 menu-icon"></i>
          <span class="menu-title">Data Servis</span>
          <i class="menu-arrow"></i>
        </a>
        <div :class="['collapse', { show: isServisActive }]" id="servis">
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/tables/basic-table.html">
                Daftar Servis
              </a>
            </li>
          </ul>
          <ul class="nav flex-column sub-menu">
            <li class="nav-item">
              <a class="nav-link" href="../../pages/tables/basic-table.html">
                Tambah Servis
              </a>
            </li>
          </ul>
        </div>
      </li>

      <!-- Icons -->
      <li class="nav-item">
        <a
          class="nav-link"
          data-bs-toggle="collapse"
          href="#icons"
          :aria-expanded="isIconsActive"
          aria-controls="icons"
        >
          <i class="icon-contract menu-icon"></i>
          <span class="menu-title">Icons</span>
          <i class="menu-arrow"></i>
        </a>
        <div :class="['collapse', { show: isIconsActive }]" id="icons">
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Group route paths untuk tiap sidebar collapse
const produkPaths = [
  '/dashboard/daftar-produk',
  '/dashboard/tambah-produk',
  '/dashboard/kategori-produk',
  '/dashboard/stok-produk',
]

const transaksiPaths = [
  // Kalau kamu pake Vue Router di sini, tambahkan route pathnya,
  // kalau pake href biasa, skip atau ubah ke router-link dulu
]

const pelangganPaths = [
  '/dashboard/daftar-customer',
  '/dashboard/add-customer',
]

const servisPaths = [
  // Sama, kalau pake router-link, masukkan di sini
]

const iconsPaths = [
  // Sama, bisa dimasukkan route path jika ada
]

// Computed untuk cek apakah route sekarang aktif di tiap grup
const isProdukActive = computed(() =>
  produkPaths.some(path => route.path.startsWith(path))
)

const isTransaksiActive = computed(() =>
  transaksiPaths.some(path => route.path.startsWith(path))
)

const isPelangganActive = computed(() =>
  pelangganPaths.some(path => route.path.startsWith(path))
)

const isServisActive = computed(() =>
  servisPaths.some(path => route.path.startsWith(path))
)

const isIconsActive = computed(() =>
  iconsPaths.some(path => route.path.startsWith(path))
)
</script>

