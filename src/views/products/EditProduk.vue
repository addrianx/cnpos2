<template>
  <div class="content-wrapper">
    <div class="container-fluid container-xl mt-3">
      <div class="row">
        <div class="col-12">
          <div v-if="successMessage" class="alert alert-success mb-4" role="alert">
            {{ successMessage }}
          </div>

          <div v-if="errorMessage" class="alert alert-danger mb-4" role="alert">
            {{ errorMessage }}
          </div>

          <div class="card shadow-sm rounded border-0 mb-4">
            <div class="card-header bg-light border-bottom d-flex align-items-center">
              <h5 class="card-title mb-0">Edit Produk</h5>
            </div>

            <form @submit.prevent="submitForm" novalidate>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nama Produk</label>
                    <input v-model="form.nama_produk" type="text" class="form-control"
                      :class="{ 'is-invalid': errors.nama_produk }" />
                    <div class="invalid-feedback">{{ errors.nama_produk }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Kategori</label>

                    <div class="d-flex gap-2">
                      <select v-model="form.kategori_id" class="form-select"
                        :class="{ 'is-invalid': errors.kategori_id }" style="flex: 1;">
                        <option value="" disabled>Pilih Kategori</option>
                        <template v-for="kategori in kategoriList" :key="kategori?.id">
                          <option v-if="kategori" :value="kategori.id">
                            {{ kategori.nama_kategori }}
                          </option>
                        </template>
                      </select>

                      <button type="button" class="btn btn-primary btn-sm" @click="showKategoriModal = true">
                        + Tambah
                      </button>
                    </div>

                    <div class="invalid-feedback">{{ errors.kategori_id }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Harga</label>
                    <input v-model="form.harga" type="number" class="form-control"
                      :class="{ 'is-invalid': errors.harga }" />
                    <div class="invalid-feedback">{{ errors.harga }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Stok</label>
                    <input v-model="form.stok" type="number" class="form-control"
                      :class="{ 'is-invalid': errors.stok }" />
                    <div class="invalid-feedback">{{ errors.stok }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Deskripsi</label>
                    <input v-model="form.deskripsi" type="text" class="form-control" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Satuan</label>
                    <select v-model="form.satuan_id" class="form-select"
                      :class="{ 'is-invalid': errors.satuan_id }">
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
                <button type="submit" class="btn btn-success">Update</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Tambah Kategori -->
    <div class="modal fade d-block" :class="{ show: showKategoriModal }" v-if="showKategoriModal"
      style="background-color: rgba(0, 0, 0, 0.5); position: fixed; inset: 0; z-index: 1050;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Kategori</h5>
            <button type="button" class="btn-close" @click="showKategoriModal = false"></button>
          </div>
          <div class="modal-body">
            <input v-model="newKategori" type="text" class="form-control" placeholder="Nama kategori baru" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showKategoriModal = false">Batal</button>
            <button class="btn btn-primary" @click="tambahKategori">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/axiosInstance' // <--- PAKAI axiosInstance custom

const route = useRoute()
const produkId = route.params.id

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
const showKategoriModal = ref(false)
const newKategori = ref('')

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
  } catch (err) {
    console.error('Gagal memuat produk:', err)
    errorMessage.value = '❌ Gagal memuat data produk.'
  }
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    await axios.put(`/produk/${produkId}`, form.value)
    successMessage.value = '✅ Produk berhasil diperbarui!'
    errorMessage.value = ''
  } catch (err) {
    console.error('Gagal update produk:', err)
    successMessage.value = ''
    errorMessage.value = '❌ Gagal menyimpan perubahan.'
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

onMounted(() => {
  getKategori()
  getSatuan()
  getProduk()
})
</script>


<style scoped>
  .invalid-feedback {
    display: block;
  }
</style>