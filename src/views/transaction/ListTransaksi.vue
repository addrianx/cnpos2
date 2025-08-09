<template>
  <div class="content-wrapper">
    <div class="container-fluid container-md mt-3">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title">Daftar Transaksi</h4>
              
              <!-- Search & Per Page -->
              <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
                <div class="d-flex align-items-center">
                    <label class="me-2">Tampilkan</label>
                    <select v-model="perPage" @change="fetchData(1)" class="form-select form-select-sm" style="width: 70px;">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                    <label class="ms-2">entri</label>
                </div>
                <form @submit.prevent="fetchData(1)" class="mt-2 mt-md-0">
                  <div class="input-group input-group-sm" style="width: 300px;">
                    <input type="search" v-model="searchQuery" class="form-control" placeholder="Cari pelanggan..." @input="debouncedSearch" />
                    <button type="submit" class="btn btn-primary">
                      <i class="ti-search"></i>
                    </button>
                  </div>
                </form>
              </div>

              <!-- Table -->
              <div class="table-responsive">
                <table class="table table-striped dataTable no-footer">
                  <thead class="bg-dark text-white">
                    <tr>
                      <th class="text-white">#</th>
                      <th class="text-white">ID Transaksi</th>
                      <th class="text-white">Pelanggan</th>
                      <th class="text-white">Metode Pembayaran</th>
                      <th class="text-white">Total</th>
                      <th class="text-white">Status</th>
                      <th class="text-white">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Loading state -->
                    <tr v-if="loading">
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>

                    <!-- No data state -->
                    <tr v-else-if="!transactions || transactions.length === 0">
                      <td colspan="7" class="text-center py-4">Tidak ada data transaksi.</td>
                    </tr>

                    <!-- Transaction data -->
                    <tr v-else v-for="(transaction, index) in transactions" :key="transaction.id">
                      <td>{{ index + 1 + ((Number(currentPage) || 1) - 1) * perPage }}</td>
                      <td>{{ transaction.id }}</td>
                      <td>{{ transaction.customer?.name || '-' }}</td>
                      <td>{{ transaction.metode_pembayaran }}</td>
                      <td>{{ formatRupiah(transaction.total) }}</td>
                      <td>
                        <label :class="statusBadgeClass(transaction.status)">
                          {{ transaction.status }}
                        </label>
                      </td>
                      <td>
                        <button 
                        class="btn btn-light btn-sm me-2"
                        @click="router.push(`/dashboard/invoice`)">
                        <i class="ti-eye text-primary"></i>View
                        </button>
                        <button class="btn btn-light btn-sm">
                          <i class="ti-close text-danger"></i>Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="d-flex justify-content-between align-items-center mt-4">
                <div class="dataTables_info" role="status" aria-live="polite">
                    Menampilkan {{ (currentPage - 1) * perPage + 1 }} sampai {{ (currentPage - 1) * perPage + transactions.length }} dari {{ total }} entri
                </div>
                <div class="dataTables_paginate paging_simple_numbers">
                  <ul class="pagination">
                    <li class="paginate_button page-item" :class="{ disabled: currentPage === 1 }">
                      <a @click.prevent="fetchData(currentPage - 1)" aria-controls="order-listing" tabindex="-1" class="page-link">Previous</a>
                    </li>
                    <li class="paginate_button page-item" :class="{ active: page === currentPage }" v-for="page in visiblePages" :key="page">
                      <a @click.prevent="fetchData(page)" class="page-link">{{ page }}</a>
                    </li>
                    <li class="paginate_button page-item" :class="{ disabled: currentPage === lastPage }">
                      <a @click.prevent="fetchData(currentPage + 1)" aria-controls="order-listing" tabindex="0" class="page-link">Next</a>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router' // ← tambahkan ini

const router = useRouter()

// Asumsikan 'api' sudah di-import dan dikonfigurasi
// import api from '@/services/api' 
const api = {
    get: async (url, config) => {
        // Ini hanya mock data untuk testing, ganti dengan API call asli Anda
        const mockData = {
            status: 'success',
            data: {
                current_page: config.params.page,
                data: Array.from({ length: config.params.per_page }, (_, i) => ({
                    id: `TRX-${(config.params.page - 1) * config.params.per_page + i + 1}`,
                    customer_id: i + 1,
                    customer: {
                        name: `Pelanggan ${i + 1 + (config.params.page - 1) * config.params.per_page}`
                    },
                    subtotal: 100000 + (i * 10000),
                    diskon: i % 2 === 0 ? 5000 : 0,
                    total: 100000 + (i * 10000) - (i % 2 === 0 ? 5000 : 0),
                    metode_pembayaran: i % 3 === 0 ? 'Tunai' : (i % 3 === 1 ? 'Kartu' : 'Transfer'),
                    status: i % 4 === 0 ? 'Selesai' : (i % 4 === 1 ? 'Proses' : (i % 4 === 2 ? 'Pending' : 'Batal')),
                })),
                first_page_url: null,
                from: (config.params.page - 1) * config.params.per_page + 1,
                last_page: 5,
                last_page_url: null,
                links: [],
                next_page_url: null,
                path: null,
                per_page: config.params.per_page,
                prev_page_url: null,
                to: config.params.page * config.params.per_page,
                total: 50,
            }
        };
        // Simulasi delay API
        await new Promise(resolve => setTimeout(resolve, 500)); 
        return { data: mockData };
    }
}

const transactions = ref([])
const loading = ref(false)
const searchQuery = ref('')
const perPage = ref(10)
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
let debounceTimeout = null

// Fungsi untuk mengambil data transaksi dari API
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get('/transactions', {
      params: {
        page,
        per_page: perPage.value,
        search: searchQuery.value
      }
    })
    
    transactions.value = res.data.data.data
    currentPage.value = res.data.data.current_page
    lastPage.value = res.data.data.last_page
    total.value = res.data.data.total
  } catch (error) {
    console.error('Gagal mengambil data transaksi:', error)
  } finally {
    loading.value = false
  }
}

// Fungsi debouncing untuk pencarian
const debouncedSearch = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    fetchData(1)
  }, 500)
}

// Fungsi untuk menentukan kelas badge berdasarkan status
const statusBadgeClass = (status) => {
  switch (status.toLowerCase()) {
    case 'selesai':
      return 'badge badge-success'
    case 'proses':
      return 'badge badge-info'
    case 'pending':
      return 'badge badge-warning'
    case 'batal':
      return 'badge badge-danger'
    default:
      return 'badge badge-secondary'
  }
}

// Fungsi untuk memformat mata uang Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

// Menampilkan halaman pagination yang terlihat
const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5 // Jumlah tombol halaman yang ingin ditampilkan
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let endPage = Math.min(lastPage.value, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }
    return pages
})


// Panggil fetchData saat komponen dimuat
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/*
  Asumsikan style dasar Bootstrap 5 dan Skydash sudah dimuat.
  Di sini hanya menambahkan beberapa style spesifik.
*/
.card-title {
  margin-bottom: 1.5rem;
}

.table-responsive {
  border-radius: 0.25rem;
}

.table thead th {
  font-weight: bold;
}

.badge {
  padding: 0.5em 0.8em;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
}

/* Skydash-like badge colors */
.badge-success {
  background-color: #198754; /* Green */
}
.badge-info {
  background-color: #0d6efd; /* Blue */
}
.badge-warning {
  background-color: #ffc107; /* Yellow */
}
.badge-danger {
  background-color: #dc3545; /* Red */
}
.badge-secondary {
  background-color: #6c757d; /* Gray */
}

.paginate_button{
    cursor: pointer;
}
</style>
