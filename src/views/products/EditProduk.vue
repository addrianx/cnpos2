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
          <div class="card shadow-sm rounded border-0 mb-4 position-relative">
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
                    <input
                      v-model="form.nama_produk"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.nama_produk }"
                      :disabled="isLoading"
                    />
                    <div class="invalid-feedback">{{ errors.nama_produk }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Kategori</label>
                    <div class="d-flex gap-2">
                      <select
                        v-model="form.kategori_id"
                        class="form-select"
                        :class="{ 'is-invalid': errors.kategori_id }"
                        style="flex: 1;"
                        :disabled="isLoading"
                      >
                        <option value="" disabled>Pilih Kategori</option>
                        <option v-for="kategori in kategoriList" :key="kategori.id" :value="kategori.id">
                          {{ kategori.nama_kategori }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-primary" @click="tambahKategori">Tambah Kategori</button>
                    </div>
                    <div class="invalid-feedback">{{ errors.kategori_id }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Harga Jual</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.harga }"
                      :value="hargaDisplay"
                      @input="onHargaInput"
                      :disabled="isLoading"
                      inputmode="numeric"
                    />
                    <div class="invalid-feedback">{{ errors.harga }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Harga Modal</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.harga_modal }"
                      :value="hargaModalDisplay"
                      @input="onHargaModalInput"
                      :disabled="isLoading"
                      inputmode="numeric"
                    />
                    <div class="invalid-feedback">{{ errors.harga_modal }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Deskripsi</label>
                    <input
                      v-model="form.deskripsi"
                      type="text"
                      class="form-control"
                      :disabled="isLoading"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Satuan</label>
                    <select
                      v-model="form.satuan_id"
                      class="form-select"
                      :class="{ 'is-invalid': errors.satuan_id }"
                      :disabled="isLoading"
                    >
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axiosInstance from '@/utils/axiosInstance'
import Swal from 'sweetalert2';

const route = useRoute()
const produkId = route.params.id

// Reactive refs untuk harga jual & harga modal yang dipisah ribuan-nya
const hargaRaw = ref('')        // simpan angka tanpa titik
const hargaModalRaw = ref('')   // simpan angka tanpa titik
const hargaDisplay = ref('')    // harga jual yang tampil dengan titik
const hargaModalDisplay = ref('') // harga modal yang tampil dengan titik

// Loading & modal states
const isLoading = ref(true)


// Form dan data
const form = ref({
  nama_produk: '',
  deskripsi: '',
  harga: '',
  harga_modal: '',
  kategori_id: '',
  satuan_id: ''
})

const errors = ref({})
const successMessage = ref('')
const errorMessage = ref('')
const kategoriList = ref([])
const satuanList = ref([])


// Watch hargaRaw supaya update hargaDisplay dengan format ribuan
watch(hargaRaw, (newVal) => {
  hargaDisplay.value = formatRibuan(newVal)
})

// Watch hargaModalRaw supaya update hargaModalDisplay dengan format ribuan
watch(hargaModalRaw, (newVal) => {
  hargaModalDisplay.value = formatRibuan(newVal)
})

// Event handler input harga jual
const onHargaInput = (event) => {
  let val = event.target.value
  val = val.replace(/[^\d]/g, '') // hapus semua selain angka

  hargaRaw.value = val
  form.value.harga = val
}

// Event handler input harga modal
const onHargaModalInput = (event) => {
  let val = event.target.value
  val = val.replace(/[^\d]/g, '') // hapus semua selain angka

  hargaModalRaw.value = val
  form.value.harga_modal = val
}

// Format angka ribuan dengan titik
function formatRibuan(x) {
  if (!x) return ''
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Bersihkan titik dan ubah ke number (dipakai sebelum kirim ke server)
const cleanDotPrice = (str) => {
  if (!str) return 0
  return Number(str.replace(/\./g, ''))
}

// Validasi form
const validateForm = () => {
  errors.value = {}

  if (!form.value.nama_produk) {
    errors.value.nama_produk = 'Nama produk wajib diisi.'
  }
  if (!form.value.kategori_id) {
    errors.value.kategori_id = 'Pilih kategori terlebih dahulu.'
  }
  if (!form.value.harga || Number(form.value.harga) <= 0) {
    errors.value.harga = 'Harga harus lebih dari 0.'
  }
  if (!form.value.harga_modal || Number(form.value.harga_modal) <= 0) {
    errors.value.harga_modal = 'Harga modal harus lebih dari 0.'
  }
  if (!form.value.satuan_id) {
    errors.value.satuan_id = 'Pilih satuan terlebih dahulu.'
  }

  return Object.keys(errors.value).length === 0
}

// API get kategori
const getKategori = async () => {
  try {
    const res = await axiosInstance.get('/kategori-produk/all')
    kategoriList.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat kategori:', err)
  }
}

// API get satuan
const getSatuan = async () => {
  try {
    const res = await axiosInstance.get('/satuan-produk')
    satuanList.value = res.data.data
  } catch (err) {
    console.error('Gagal memuat satuan:', err)
  }
}

// API get produk by id
const getProduk = async () => {
  try {
    const res = await axiosInstance.get(`/produk/${produkId}`)
    const data = res.data
    const hargaBulat = data.harga ? Math.floor(Number(data.harga)) : 0
    const hargaModalBulat = data.harga_modal ? Math.floor(Number(data.harga_modal)) : 0

    form.value = {
      nama_produk: data.nama_produk,
      deskripsi: data.deskripsi || '',
      harga: hargaBulat.toString(),
      harga_modal: hargaModalBulat.toString(),
      kategori_id: data.kategori_id,
      satuan_id: data.satuan_id
    }

    hargaRaw.value = data.harga?.toString() || ''
    hargaModalRaw.value = data.harga_modal?.toString() || ''
    errorMessage.value = ''
  } catch (err) {
    console.error('[getProduk Error]', err.response?.data || err.message)
    if (err.response) {
      switch (err.response.status) {
        case 401: errorMessage.value = 'Sesi telah berakhir. Silakan login kembali.'; break
        case 403: errorMessage.value = 'Anda tidak memiliki izin untuk mengakses data ini.'; break
        case 404: errorMessage.value = 'Data produk tidak ditemukan.'; break
        case 500: errorMessage.value = 'Terjadi kesalahan server. Silakan coba lagi nanti.'; break
        default:  errorMessage.value = 'Gagal memuat data produk. Silakan coba lagi.'
      }
    } else if (err.request) {
      errorMessage.value = 'Tidak ada respon dari server. Periksa koneksi internet Anda.'
    } else {
      errorMessage.value = 'Terjadi kesalahan saat memuat data produk.'
    }

    setTimeout(() => errorMessage.value = '', 5000)
  }
}


// Submit form update produk
const submitForm = async () => {
  if (!validateForm()) return

  form.value.harga = cleanDotPrice(hargaRaw.value)
  form.value.harga_modal = cleanDotPrice(hargaModalRaw.value)

  try {
    isLoading.value = true
    await axiosInstance.put(`/produk/${produkId}`, form.value)
    successMessage.value = '✅ Produk berhasil diperbarui!'
    errorMessage.value = ''
  } catch (err) {
    console.error('Gagal update produk:', err)
    errorMessage.value = '❌ Gagal menyimpan perubahan.'
  } finally {
    isLoading.value = false
  }
}

// Tambah kategori baru
const tambahKategori = async () => {
  const { value: namaKategori } = await Swal.fire({
    title: 'Tambah Kategori',
    input: 'text',
    inputLabel: 'Nama Kategori',
    inputPlaceholder: 'Masukkan nama kategori',
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Nama kategori tidak boleh kosong!';
      }
    }
  });

  if (!namaKategori) return; // Jika user batal

  try {
    const res = await axiosInstance.post('/kategori-produk', {
      nama_kategori: namaKategori.trim()
    });

    kategoriList.value.push(res.data);
    form.value.kategori_id = res.data.id;

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Kategori berhasil ditambahkan!'
    });
  } catch (err) {
    console.error(err);
    if (err.response?.data?.errors?.nama_kategori) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response.data.errors.nama_kategori[0]
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menambahkan kategori.'
      });
    }
  }
};

// Lifecycle hooks
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
