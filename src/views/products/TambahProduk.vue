<template>
  <div class="content-wrapper">
    <!-- Responsive Container -->
    <div class="container-fluid container-md mt-4">
      <div class="row">
        <div class="col-12">

          <!-- Alert Success -->
          <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
            {{ successMessage }}
            <button type="button" class="btn-close" @click="successMessage = ''"></button>
          </div>

          <!-- Alert Error -->
          <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ errorMessage }}
            <button type="button" class="btn-close" @click="errorMessage = ''"></button>
          </div>

          <!-- Card Produk -->
          <div class="card">
            <div class="card-body">
              <h4 class="card-title mb-4">Tambah Produk</h4>

              <!-- Form Tambah Produk -->
              <form @submit.prevent="submitForm" novalidate>
                <div class="row g-3">
                  <!-- Nama Produk -->
                  <div class="col-md-6">
                    <label class="form-label">Nama Produk <span class="text-danger">*</span></label>
                    <input
                      v-model="form.nama_produk"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.nama_produk }"
                      placeholder="Masukkan nama produk"
                    />
                    <div class="invalid-feedback">{{ errors.nama_produk }}</div>
                  </div>

                  <!-- Kategori -->
                  <div class="col-md-6">
                    <label class="form-label">Kategori <span class="text-danger">*</span></label>
                    <div class="d-flex gap-2">
                      <select
                        v-model="form.kategori_id"
                        class="form-select"
                        :class="{ 'is-invalid': errors.kategori_id }"
                        style="flex: 1;"
                      >
                        <option value="" disabled selected>Pilih Kategori</option>
                        <option
                          v-for="kategori in kategoriList"
                          :key="kategori.id"
                          :value="kategori.id"
                        >
                          {{ kategori.nama_kategori }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-primary btn-sm" @click="showKategoriModal = true">
                        <i class="fa fa-plus"></i> Tambah
                      </button>
                    </div>
                    <div class="invalid-feedback">{{ errors.kategori_id }}</div>
                  </div>

                  <!-- Harga -->
                  <div class="col-md-6">
                    <label class="form-label">Harga <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">Rp</span>
                      <input
                        v-model="form.harga"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': errors.harga }"
                        placeholder="Masukkan harga"
                        min="0"
                      />
                    </div>
                    <div class="invalid-feedback">{{ errors.harga }}</div>
                  </div>

                  <!-- Stok -->
                  <div class="col-md-6">
                    <label class="form-label">Stok <span class="text-danger">*</span></label>
                    <input
                      v-model="form.stok"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.stok }"
                      placeholder="Masukkan jumlah stok"
                      min="0"
                    />
                    <div class="invalid-feedback">{{ errors.stok }}</div>
                  </div>

                  <!-- Deskripsi -->
                  <div class="col-12">
                    <label class="form-label">Deskripsi</label>
                    <textarea
                      v-model="form.deskripsi"
                      class="form-control"
                      rows="3"
                      placeholder="Masukkan deskripsi produk"
                    ></textarea>
                  </div>

                  <!-- Satuan -->
                  <div class="col-md-6">
                    <label class="form-label">Satuan <span class="text-danger">*</span></label>
                    <select
                      v-model="form.satuan_id"
                      class="form-select"
                      :class="{ 'is-invalid': errors.satuan_id }"
                    >
                      <option value="" disabled selected>Pilih Satuan</option>
                      <option v-for="satuan in satuanList" :key="satuan.id" :value="satuan.id">
                        {{ satuan.nama_satuan }}
                      </option>
                    </select>
                    <div class="invalid-feedback">{{ errors.satuan_id }}</div>
                  </div>

                  <!-- Gambar Produk -->
                  <div class="col-md-6">
                    <label class="form-label">Gambar Produk</label>
                    <input
                      type="file"
                      class="form-control"
                      @change="handleFileUpload"
                      accept="image/*"
                    />
                    <small class="text-muted">Format: JPG, PNG (Maks. 2MB)</small>
                  </div>
                </div>

                <!-- Submit -->
                <div class="mt-4 d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetForm">Reset</button>
                  <button type="submit" class="btn btn-info text-white">
                    <i class="fas fa-save me-1"></i> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Tambah Kategori -->
    <div
      class="modal fade"
      :class="{ show: showKategoriModal }"
      v-if="showKategoriModal"
      tabindex="-1"
      style="display: block; background-color: rgba(0, 0, 0, 0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Kategori Baru</h5>
            <button type="button" class="btn-close" @click="closeKategoriModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nama Kategori <span class="text-danger">*</span></label>
              <input 
                v-model="newKategori" 
                type="text" 
                class="form-control" 
                placeholder="Masukkan nama kategori"
                @keyup.enter="tambahKategori"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeKategoriModal">Batal</button>
            <button type="button" class="btn btn-primary" @click="tambahKategori">
              <i class="fa fa-save me-1"></i> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// State form dan validasi
const form = ref({
  nama_produk: '',
  deskripsi: '',
  harga: '',
  stok: '',
  kategori_id: '',
  satuan_id: '',
  gambar: null
})

const showKategoriModal = ref(false)
const newKategori = ref('')
const errors = ref({})
const successMessage = ref('')
const errorMessage = ref('')
const kategoriList = ref([])
const satuanList = ref([])
const token = localStorage.getItem('token')

// Handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file terlalu besar (Maks. 2MB)'
      event.target.value = '' // Reset input file
      return
    }
    form.value.gambar = file
  }
}

// Validasi manual
const validateForm = () => {
  errors.value = {}

  if (!form.value.nama_produk) {
    errors.value.nama_produk = 'Nama produk wajib diisi.'
  } else if (form.value.nama_produk.length > 100) {
    errors.value.nama_produk = 'Nama produk maksimal 100 karakter.'
  }

  if (!form.value.kategori_id) {
    errors.value.kategori_id = 'Pilih kategori terlebih dahulu.'
  }

  if (!form.value.harga) {
    errors.value.harga = 'Harga wajib diisi.'
  } else if (form.value.harga <= 0) {
    errors.value.harga = 'Harga harus lebih dari 0.'
  }

  if (!form.value.stok) {
    errors.value.stok = 'Stok wajib diisi.'
  } else if (form.value.stok < 0) {
    errors.value.stok = 'Stok tidak boleh negatif.'
  }

  if (!form.value.satuan_id) {
    errors.value.satuan_id = 'Pilih satuan terlebih dahulu.'
  }

  return Object.keys(errors.value).length === 0
}

const getKategori = async () => {
  try {
    const res = await axios.get('http://localhost/login_api_lumen/public/api/kategori-produk/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    kategoriList.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat kategori:', err)
    if (err.response?.status === 401) {
      errorMessage.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }
}

const getSatuan = async () => {
  try {
    const res = await axios.get('http://localhost/login_api_lumen/public/api/satuan-produk', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    satuanList.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat satuan:', err)
    if (err.response?.status === 401) {
      errorMessage.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    const formData = new FormData()
    formData.append('nama_produk', form.value.nama_produk)
    formData.append('deskripsi', form.value.deskripsi)
    formData.append('harga', form.value.harga)
    formData.append('stok', form.value.stok)
    formData.append('kategori_id', form.value.kategori_id)
    formData.append('satuan_id', form.value.satuan_id)
    if (form.value.gambar) {
      formData.append('gambar', form.value.gambar)
    }

    await axios.post('http://localhost/login_api_lumen/public/api/produk', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })

    successMessage.value = 'Produk berhasil ditambahkan!'
    errorMessage.value = ''
    resetForm()
    
    // Redirect setelah 2 detik
    setTimeout(() => {
      router.push('/produk')
    }, 2000)
  } catch (err) {
    console.error('Gagal menyimpan produk:', err)
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors
      errorMessage.value = 'Silakan periksa kembali form yang Anda isi.'
    } else if (err.response?.status === 401) {
      errorMessage.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.'
    }
  }
}

const tambahKategori = async () => {
  if (!newKategori.value.trim()) {
    errorMessage.value = 'Nama kategori tidak boleh kosong.'
    return
  }

  try {
    const res = await axios.post('http://localhost/login_api_lumen/public/api/kategori-produk', {
      nama_kategori: newKategori.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Tambahkan ke list dan pilih kategori baru
    kategoriList.value.push(res.data.data)
    form.value.kategori_id = res.data.data.id

    // Reset form modal
    newKategori.value = ''
    showKategoriModal.value = false
    successMessage.value = 'Kategori berhasil ditambahkan!'
  } catch (err) {
    console.error(err)
    if (err.response?.status === 422) {
      errorMessage.value = err.response.data.errors.nama_kategori[0]
    } else if (err.response?.status === 401) {
      errorMessage.value = 'Sesi Anda telah berakhir. Silakan login kembali.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = 'Gagal menambahkan kategori.'
    }
  }
}

const resetForm = () => {
  form.value = {
    nama_produk: '',
    deskripsi: '',
    harga: '',
    stok: '',
    kategori_id: '',
    satuan_id: '',
    gambar: null
  }
  errors.value = {}
}

const closeKategoriModal = () => {
  showKategoriModal.value = false
  newKategori.value = ''
}

onMounted(() => {
  getKategori()
  getSatuan()
})
</script>

<style scoped>
.invalid-feedback {
  display: block;
}

.modal {
  backdrop-filter: blur(2px);
}

/* Animasi untuk modal */
.modal.fade.show {
  opacity: 1;
}

.modal.fade {
  transition: opacity 0.15s linear;
}

.modal-dialog {
  transition: transform 0.3s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
  
  .row.g-3 {
    gap: 1rem 0;
  }
}
</style>