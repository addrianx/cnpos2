<template>
  <div class="content-wrapper">
    <div class="container-fluid container-xl mt-3">
      <div class="row">
        <div class="col-12">
          <!-- Alert Messages -->
          <div v-if="successMessage" class="alert alert-success mb-4" role="alert">
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="alert alert-danger mb-4" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Main Card -->
          <div class="card shadow-sm rounded border-0 mb-4">
            <!-- Loading Overlay -->
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div class="card-header bg-light border-bottom d-flex align-items-center">
              <h5 class="card-title mb-0">Edit Produk</h5>
            </div>

            <form @submit.prevent="submitForm" novalidate>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nama Produk</label>
                    <input v-model="form.nama_produk" type="text" class="form-control"
                      :class="{ 'is-invalid': errors.nama_produk }" :disabled="isLoading" />
                    <div class="invalid-feedback">{{ errors.nama_produk }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Kategori</label>
                    <div class="d-flex gap-2">
                      <select v-model="form.kategori_id" class="form-select"
                        :class="{ 'is-invalid': errors.kategori_id }" style="flex: 1;" :disabled="isLoading">
                        <option value="" disabled>Pilih Kategori</option>
                        <template v-for="kategori in kategoriList" :key="kategori?.id">
                          <option v-if="kategori" :value="kategori.id">
                            {{ kategori.nama_kategori }}
                          </option>
                        </template>
                      </select>
                      <button type="button" class="btn btn-primary btn-sm" @click="showKategoriModal = true" :disabled="isLoading">
                        + Tambah
                      </button>
                    </div>
                    <div class="invalid-feedback">{{ errors.kategori_id }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Harga</label>
                    <input v-model="form.harga" type="number" class="form-control"
                      :class="{ 'is-invalid': errors.harga }" :disabled="isLoading" />
                    <div class="invalid-feedback">{{ errors.harga }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Stok</label>
                    <div class="input-group">
                      <input 
                        v-model="form.stok" 
                        type="number" 
                        class="form-control"
                        :class="{ 'is-invalid': errors.stok }" 
                        :disabled="!isStockEditable || isLoading"
                      >
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button" 
                        @click="showPasswordModal = true"
                        :disabled="isLoading"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                    </div>
                    <div class="invalid-feedback">{{ errors.stok }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Deskripsi</label>
                    <input v-model="form.deskripsi" type="text" class="form-control" :disabled="isLoading" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Satuan</label>
                    <select v-model="form.satuan_id" class="form-select"
                      :class="{ 'is-invalid': errors.satuan_id }" :disabled="isLoading">
                      <option value="" disabled>Pilih Satuan</option>
                      <option v-for="satuan in satuanList" :key="satuan.id" :value="satuan.id">
                        {{ satuan.nama_satuan }}
                      </option>
                    </select>
                    <div class="invalid-feedback">{{ errors.satuan_id }}</div>
                  </div>
                </div>
              </div>

              <div class="card-footer d-flex justify-content-end bg-light border-top">
                <button type="submit" class="btn btn-success text-white" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isLoading ? 'Memproses...' : 'Update' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  <!-- Dynamic Modal for Kategori -->
  <DynamicModal
    :show="showKategoriModal"
    title="Tambah Kategori"
    :loading="isModalLoading"
    loading-text="Menyimpan..."
    @close="showKategoriModal = false"
    @confirm="tambahKategori"
    :disable-confirm="!newKategori.trim()"
  >
    <template #body>
      <input 
        v-model="newKategori" 
        type="text" 
        class="form-control" 
        placeholder="Nama kategori baru" 
        :disabled="isModalLoading"
      >
    </template>
  </DynamicModal>

  <!-- Dynamic Modal for Password -->
  <DynamicModal
    :show="showPasswordModal"
    title="Verifikasi Admin"
    :loading="isVerifying"
    confirm-text="Verifikasi"
    @close="closePasswordModal"
    @confirm="verifyAdminPassword"
    :disable-confirm="!adminPassword"
  >
    <template #body>
      <div class="mb-3">
        <label class="form-label">Password Admin</label>
        <input 
          v-model="adminPassword" 
          type="password" 
          class="form-control" 
          placeholder="Masukkan password admin"
          :disabled="isVerifying"
        >
      </div>
    </template>
  </DynamicModal>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/axiosInstance'
import DynamicModal from '@/components/DynamicModal.vue'

const route = useRoute()
const produkId = route.params.id

// Loading states
const isLoading = ref(true)
const isModalLoading = ref(false)
const isVerifying = ref(false)
const isStockEditable = ref(false)

// Modal states
const showKategoriModal = ref(false)
const showPasswordModal = ref(false)
const adminPassword = ref('')
const newKategori = ref('')

// Form and data
const form = ref({
  nama_produk: '',
  deskripsi: '',
  harga: '',
  stok: '',
  kategori_id: '',
  satuan_id: ''
})

const errors = ref({})
const successMessage = ref('')
const errorMessage = ref('')
const kategoriList = ref([])
const satuanList = ref([])

// Password modal functions
const closePasswordModal = () => {
  showPasswordModal.value = false
  adminPassword.value = ''
  isVerifying.value = false
}

const verifyAdminPassword = async () => {
  try {
    isVerifying.value = true
    const response = await axios.post('/verify-password', {
      password: adminPassword.value
    })
    
    if (response.data.success) {
      isStockEditable.value = true
      closePasswordModal()
      successMessage.value = 'Akses edit stok diaktifkan'
      setTimeout(() => successMessage.value = '', 3000)
    } else {
      closePasswordModal()
      errorMessage.value = 'Password admin salah!'
      setTimeout(() => errorMessage.value = '', 4000)
    }
  } catch (error) {
    console.error('Verifikasi gagal:', error)
    errorMessage.value = 'Terjadi kesalahan saat verifikasi'
  } finally {
    isVerifying.value = false
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.nama_produk) {
    errors.value.nama_produk = 'Nama produk wajib diisi.'
  }
  if (!form.value.kategori_id) {
    errors.value.kategori_id = 'Pilih kategori terlebih dahulu.'
  }
  if (!form.value.harga || form.value.harga <= 0) {
    errors.value.harga = 'Harga harus lebih dari 0.'
  }
  if (!form.value.stok || form.value.stok < 0) {
    errors.value.stok = 'Stok tidak boleh kosong.'
  }
  if (!form.value.satuan_id) {
    errors.value.satuan_id = 'Pilih satuan terlebih dahulu.'
  }

  return Object.keys(errors.value).length === 0
}

const getKategori = async () => {
  try {
    const res = await axios.get('/kategori-produk/all')
    kategoriList.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat kategori:', err)
  }
}

const getSatuan = async () => {
  try {
    const res = await axios.get('/satuan-produk')
    satuanList.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat satuan:', err)
  }
}

const getProduk = async () => {
  try {
    const res = await axios.get(`/produk/${produkId}`)
    const data = res.data
    
    form.value = {
      nama_produk: data.nama_produk,
      deskripsi: data.deskripsi || '',
      harga: data.harga,
      stok: data.stok,
      kategori_id: data.kategori_id,
      satuan_id: data.satuan_id
    }
    
    // Reset error message jika sebelumnya ada error
    errorMessage.value = ''
    
  } catch (err) {
    console.error('[getProduk Error]', err.response?.data || err.message)
    
    // Handle error berdasarkan status code
    if (err.response) {
      switch (err.response.status) {
        case 401: // Unauthorized
          errorMessage.value = 'Sesi telah berakhir. Silakan login kembali.'
          // Interceptor sudah akan handle redirect ke login
          break
          
        case 403: // Forbidden
          errorMessage.value = 'Anda tidak memiliki izin untuk mengakses data ini.'
          break
          
        case 404: // Not Found
          errorMessage.value = 'Data produk tidak ditemukan.'
          break
          
        case 500: // Server Error
          errorMessage.value = 'Terjadi kesalahan server. Silakan coba lagi nanti.'
          break
          
        default:
          errorMessage.value = 'Gagal memuat data produk. Silakan coba lagi.'
      }
    } else if (err.request) {
      // Request dibuat tapi tidak mendapat response
      errorMessage.value = 'Tidak ada respon dari server. Periksa koneksi internet Anda.'
    } else {
      // Error lainnya
      errorMessage.value = 'Terjadi kesalahan saat memuat data produk.'
    }
    
    // Optional: Auto-clear error message setelah beberapa detik
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    await axios.put(`/produk/${produkId}`, form.value)
    successMessage.value = '✅ Produk berhasil diperbarui!'
    errorMessage.value = ''
  } catch (err) {
    console.error('Gagal update produk:', err)
    errorMessage.value = '❌ Gagal menyimpan perubahan.'
  } finally {
    isLoading.value = false
  }
}

const tambahKategori = async () => {
  if (!newKategori.value.trim()) return alert('Nama kategori tidak boleh kosong.')

  try {
    const res = await axios.post('/kategori-produk', {
      nama_kategori: newKategori.value
    })

    kategoriList.value.push(res.data)
    form.value.kategori_id = res.data.id

    newKategori.value = ''
    showKategoriModal.value = false

    alert('✅ Kategori berhasil ditambahkan!')
  } catch (err) {
    console.error(err)
    if (err.response?.data?.errors?.nama_kategori) {
      alert('❌ ' + err.response.data.errors.nama_kategori[0])
    } else {
      alert('❌ Gagal menambahkan kategori.')
    }
  }
}

onMounted(async () => {
  try {
    await getKategori()
    await getSatuan()
    await getProduk()
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = 'Sesi habis. Silakan login ulang.'
    } else {
      errorMessage.value = 'Gagal memuat data awal. Coba refresh halaman.'
      console.error('Initialization error:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data
      })
    }
  } finally {
    isLoading.value = false
  }
})
</script>


<style scoped>
.invalid-feedback {
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 0.375rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}
</style>