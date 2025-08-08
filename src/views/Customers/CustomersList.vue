<template>
  <div class="content-wrapper">
    <div class="container-fluid container-md mt-3">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">

              <!-- Header dan Search -->
              <div class="d-flex justify-content-between align-items-start flex-wrap mb-3">
                <div class="flex-grow-1">
                  <h4 class="card-title mb-1">Daftar Pelanggan</h4>
                  <p class="card-description mb-0">
                    Cari dan kelola data pelanggan
                  </p>
                </div>

                <form @submit.prevent="fetchData(1)" class="mt-2 mt-md-0" style="flex-shrink: 0;">
                  <div class="input-group input-group-sm" style="width: 300px;">
                    <input type="text" v-model="searchQuery" class="form-control" placeholder="Cari pelanggan..."
                      @input="debouncedSearch" />
                    <button type="submit" class="btn btn-primary">
                      <i class="fa fa-search"></i>
                    </button>
                  </div>
                </form>
              </div>

              <!-- Table -->
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th><input type="checkbox" @change="toggleSelectAll" v-model="selectAll" /></th>
                      <th>#</th>
                      <th>Nama</th>
                      <th>No. HP</th>
                      <th>Alamat</th>
                      <th>Poin Loyalitas</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Loading -->
                    <tr v-if="loading">
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Tidak ada data -->
                    <tr v-else-if="items.length === 0">
                      <td colspan="7" class="text-center py-4">Tidak ada data ditemukan.</td>
                    </tr>

                    <!-- Data pelanggan -->
                    <tr v-else v-for="(customer, index) in items" :key="customer.id">
                      <td><input type="checkbox" v-model="selectedItems" :value="customer.id" /></td>
                      <td @click="goToEdit(customer.id)" style="cursor:pointer;">
                        {{ index + 1 + ((Number(currentPage) || 1) - 1) * perPage }}
                      </td>
                      <td @click="goToEdit(customer.id)" style="cursor:pointer;">{{ customer.name }}</td>
                      <td @click="goToEdit(customer.id)" style="cursor:pointer;">{{ customer.phone }}</td>
                      <td @click="goToEdit(customer.id)" style="cursor:pointer;">{{ customer.address || '-' }}</td>
                      <td @click="goToEdit(customer.id)">
                        <span :class="{
                          'text-success': customer.loyalty_points > 100,
                          'text-warning': customer.loyalty_points <= 100 && customer.loyalty_points > 0,
                          'text-danger': customer.loyalty_points <= 0
                        }">
                          {{ customer.loyalty_points }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-danger" @click.stop="deleteItem(customer.id)">
                          <i class="fa fa-trash text-white"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Bulk Delete & Pagination -->
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
import { ref, computed, onMounted } from 'vue'
import debounce from 'lodash/debounce'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import api from '@/utils/axiosInstance'

const router = useRouter()
const loading = ref(false)
const items = ref([])
const selectedItems = ref([])
const selectAll = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const searchQuery = ref('')
const perPage = 10

// Ambil data pelanggan
const fetchData = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get('/customers', {
      params: {
        page,
        per_page: perPage,
        search: searchQuery.value
      }
    })
    items.value = res.data
    console.log(items.value)
    currentPage.value = res.data.current_page
    lastPage.value = res.data.last_page
  } catch (error) {
    console.error('Gagal ambil data:', error)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => fetchData(1), 500)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(currentPage.value - 1, 1)
  const end = Math.min(currentPage.value + 1, lastPage.value)
  for (let i = start; i <= end; i++) pages.push(i)
  if (currentPage.value <= 2 && lastPage.value >= 3) return [1, 2, 3]
  if (currentPage.value >= lastPage.value - 1) {
    return [lastPage.value - 2, lastPage.value - 1, lastPage.value].filter(p => p > 0)
  }
  return pages
})

const goToEdit = (id) => {
  router.push(`/dashboard/edit-customer/${id}`)
}

const deleteItem = async (id) => {
  const confirm = await Swal.fire({
    title: 'Yakin?',
    text: 'Data pelanggan akan dihapus!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
  })

  if (confirm.isConfirmed) {
    try {
      await api.delete(`/customers/${id}`)
      await fetchData(currentPage.value)
      Swal.fire('Berhasil', 'Pelanggan berhasil dihapus.', 'success')
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
  const { value: password } = await Swal.fire({
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
    await api.delete('/customers/bulk-delete', {
      data: {
        ids: selectedItems.value,
        password
      }
    })
    await fetchData(currentPage.value)
    selectedItems.value = []
    Swal.fire('Sukses', 'Pelanggan yang dipilih telah dihapus.', 'success')
  } catch (error) {
    Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat menghapus.', 'error')
  }
}

onMounted(() => {
  fetchData()
})
</script>
