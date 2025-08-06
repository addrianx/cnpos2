<template>
  <div class="content-wrapper">
    <div class="container-fluid container-md mt-3">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
            <div class="d-flex justify-content-between align-items-start flex-wrap mb-3">
              <!-- Kiri: Title dan Deskripsi -->
              <div class="flex-grow-1">
                <h4 class="card-title mb-1">Daftar Produk</h4>
                <p class="card-description mb-0">
                  Cari, dan kelola produk
                </p>
              </div>

              <!-- Kanan: Form Search -->
              <form @submit.prevent="fetchData(1)" class="mt-2 mt-md-0" style="flex-shrink: 0;">
                <div class="input-group input-group-sm" style="width: 300px;">
                  <input type="text" v-model="searchQuery" class="form-control" placeholder="Cari produk..."
                    @input="debouncedSearch" />
                  <button type="submit" class="btn btn-primary">
                    <i class="fa fa-search"></i>
                  </button>
                </div>
              </form>
            </div>


              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th><input type="checkbox" @change="toggleSelectAll" v-model="selectAll" /></th>
                      <th>#</th>
                      <th>Nama Produk</th>
                      <th>Kategori</th>
                      <th>Satuan</th>
                      <th>Harga</th>
                      <th>Stok</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Spinner saat loading -->
                    <tr v-if="loading">
                      <td colspan="8" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Tampilkan pesan jika tidak ada data -->
                    <tr v-else-if="items.length === 0">
                      <td colspan="8" class="text-center py-4">Tidak ada data ditemukan.</td>
                    </tr>

                    <!-- Tampilkan data produk -->
                    <tr v-else v-for="(produk, index) in items" :key="produk.id">
                      <td><input type="checkbox" v-model="selectedItems" :value="produk.id" /></td>
                      <td @click="goToEdit(produk.id)" style="cursor:pointer;">
                        {{ index + 1 + ((Number(currentPage) || 1) - 1) * perPage }}
                      </td>
                      <td @click="goToEdit(produk.id)" style="cursor:pointer;">{{ produk.nama_produk }}</td>
                      <td @click="goToEdit(produk.id)" style="cursor:pointer;">{{ produk.kategori?.nama_kategori || '-' }}</td>
                      <td @click="goToEdit(produk.id)" style="cursor:pointer;">{{ produk.satuan?.nama_satuan || '-' }}</td>
                      <td @click="goToEdit(produk.id)" style="cursor:pointer;">Rp{{ Number(produk.harga).toLocaleString('id-ID') }}</td>
                      <td @click="goToEdit(produk.id)" style="cursor:pointer;">{{ produk.stok }}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" @click.stop="deleteItem(produk.id)">
                          <i class="fa fa-trash text-white"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-4">
                <button class="btn btn-danger" :disabled="selectedItems.length === 0" @click="confirmBulkDelete">
                  Hapus Terpilih ({{ selectedItems.length }})
                </button>

                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm" :disabled="currentPage === 1"
                    @click="fetchData(currentPage - 1)">
                    «
                  </button>
                  <button v-for="page in visiblePages" :key="page"
                    :class="['btn', 'btn-sm', page === currentPage ? 'btn-primary' : 'btn-outline-primary']"
                    @click="fetchData(page)">
                    {{ page }}
                  </button>
                  <button class="btn btn-outline-primary btn-sm" :disabled="currentPage === lastPage"
                    @click="fetchData(currentPage + 1)">
                    »
                  </button>
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
  import {
    ref,
    computed,
    onMounted
  } from 'vue'
  import axios from 'axios'
  import debounce from 'lodash/debounce'
  import {
    useRouter
  } from 'vue-router'
  import Swal from 'sweetalert2'

  const router = useRouter()
  const loading = ref(false)
  const items = ref([])
  const selectedItems = ref([])
  const selectAll = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const searchQuery = ref('')
  const perPage = 10

  // Buat instance Axios dengan base URL
  const api = axios.create({
    baseURL: 'http://localhost/login_api_lumen/public/api',
  })

  // Request interceptor → otomatis set token
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  }, error => Promise.reject(error))

  // Response interceptor → refresh token saat expired
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          const token = localStorage.getItem('token')
          const res = await api.post('/refresh', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          const newToken = res.data.token
          localStorage.setItem('token', newToken)

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          return api(originalRequest)
        } catch (refreshError) {
          localStorage.removeItem('token')
          router.push('/login')
          return Promise.reject(refreshError)
        }
      }
      return Promise.reject(error)
    }
  )

  // Ambil data dari API
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get('/produk', {
      params: {
        page,
        per_page: perPage,
        search: searchQuery.value
      }
    })
    items.value = res.data.data
    currentPage.value = res.data.current_page
    lastPage.value = res.data.last_page
  } catch (error) {
    console.error('Gagal ambil data:', error)
  } finally {
    loading.value = false
  }
}

  const debouncedSearch = debounce(() => fetchData(1), 500)

  onMounted(() => {
    fetchData()
  })

  const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(currentPage.value - 1, 1)
    const end = Math.min(currentPage.value + 1, lastPage.value)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage.value <= 2 && lastPage.value >= 3) return [1, 2, 3]
    if (currentPage.value >= lastPage.value - 1) return [lastPage.value - 2, lastPage.value - 1, lastPage.value]
      .filter(p => p > 0)
    return pages
  })

  const goToEdit = (id) => {
    router.push(`/dashboard/edit-produk/${id}`)
  }

  const deleteItem = async (id) => {
    const confirm = await Swal.fire({
      title: 'Yakin?',
      text: 'Data produk akan dihapus!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus!',
    })

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/produk/${id}`)
        await fetchData(currentPage.value)
        Swal.fire('Berhasil', 'Produk berhasil dihapus.', 'success')
      } catch (err) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus.', 'error')
      }
    }
  }

  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedItems.value = items.value.map(i => i.id)
    } else {
      selectedItems.value = []
    }
  }

  const confirmBulkDelete = async () => {
    const {
      value: password
    } = await Swal.fire({
      title: 'Konfirmasi Hapus Massal',
      input: 'password',
      inputLabel: 'Masukkan password Anda',
      inputPlaceholder: 'Password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true
    })

    if (!password) return

    try {
      await api.delete('/produk/bulk-delete', {
        data: {
          ids: selectedItems.value,
          password
        }
      })
      await fetchData(currentPage.value)
      selectedItems.value = []
      Swal.fire('Sukses', 'Produk yang dipilih telah dihapus.', 'success')
    } catch (error) {
      Swal.fire('Gagal', error.response ?.data ?.message || 'Terjadi kesalahan saat menghapus.', 'error')
    }
  }
</script>


<style>
  .table-responsive {
    width: 100%;
    overflow-x: auto;
  }

  .table {
    white-space: nowrap;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .pagination button {
    margin: 0;
    padding: 6px 12px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
  }

  .pagination .active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }

  .table-row-clickable {
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }

  .table-row-clickable:hover {
    background-color: #f2f2f2;
  }

  .card-produk {
    background-color: #ebebeb00 !important;
    padding: 1.6rem;
    border: 1px solid darkgrey;
  }

  .card-header-produk {
    background-color: #ebebeb !important;
  }

  @media screen and (max-width: 767px) {
    .card-produk {
      padding: .4rem;
    }
  }
</style>