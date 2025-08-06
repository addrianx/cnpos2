<template>
  <div class="content-wrapper">
    <!-- Responsive Container -->
    <div class="container-fluid container-md mt-4">
      <div class="row">
        <div class="col-12">

          <!-- Alert Success -->
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>

          <!-- Alert Error -->
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
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
                    <label class="form-label">Nama Produk</label>
                    <input
                      v-model="form.nama_produk"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.nama_produk }"
                    />
                    <div class="invalid-feedback">{{ errors.nama_produk }}</div>
                  </div>

                  <!-- Kategori -->
                  <div class="col-md-6">
                    <label class="form-label">Kategori</label>
                    <div class="d-flex gap-2">
                      <select
                        v-model="form.kategori_id"
                        class="form-select"
                        :class="{ 'is-invalid': errors.kategori_id }"
                        style="flex: 1;"
                      >
                        <option value="" disabled>Pilih Kategori</option>
                        <option
                          v-for="kategori in kategoriList"
                          :key="kategori.id"
                          :value="kategori.id"
                        >
                          {{ kategori.nama_kategori }}
                        </option>
                      </select>
                      <button type="button" class="btn btn-primary btn-sm" @click="showKategoriModal = true">
                        + Tambah
                      </button>
                    </div>
                    <div class="invalid-feedback">{{ errors.kategori_id }}</div>
                  </div>

                  <!-- Harga -->
                  <div class="col-md-6">
                    <label class="form-label">Harga</label>
                    <input
                      v-model="form.harga"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.harga }"
                    />
                    <div class="invalid-feedback">{{ errors.harga }}</div>
                  </div>

                  <!-- Stok -->
                  <div class="col-md-6">
                    <label class="form-label">Stok</label>
                    <input
                      v-model="form.stok"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': errors.stok }"
                    />
                    <div class="invalid-feedback">{{ errors.stok }}</div>
                  </div>

                  <!-- Deskripsi -->
                  <div class="col-md-6">
                    <label class="form-label">Deskripsi</label>
                    <input v-model="form.deskripsi" type="text" class="form-control" />
                  </div>

                  <!-- Satuan -->
                  <div class="col-md-6">
                    <label class="form-label">Satuan</label>
                    <select
                      v-model="form.satuan_id"
                      class="form-select"
                      :class="{ 'is-invalid': errors.satuan_id }"
                    >
                      <option value="" disabled>Pilih Satuan</option>
                      <option v-for="satuan in satuanList" :key="satuan.id" :value="satuan.id">
                        {{ satuan.nama_satuan }}
                      </option>
                    </select>
                    <div class="invalid-feedback">{{ errors.satuan_id }}</div>
                  </div>
                </div>

                <!-- Submit -->
                <div class="mt-4 d-flex justify-content-end">
                  <button type="submit" class="btn btn-info">Simpan</button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Tambah Kategori -->
    <div
      class="modal fade show d-block"
      :class="{ show: showKategoriModal }"
      v-if="showKategoriModal"
      style="background-color: rgba(0, 0, 0, 0.5); position: fixed; inset: 0; z-index: 1050;"
    >
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
    import {
        ref,
        onMounted
    } from 'vue'
    import axios from 'axios'

    // State form dan validasi
    const form = ref({
        nama_produk: '',
        deskripsi: '',
        harga: '',
        stok: '',
        kategori_id: '',
        satuan_id: ''
    })

    const showKategoriModal = ref(false)
    const newKategori = ref('')
    const errors = ref({})
    const successMessage = ref('')
    const errorMessage = ref('')
    const kategoriList = ref([])
    const satuanList = ref([])
    const token = localStorage.getItem('token')

    // Validasi manual
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
            const res = await axios.get('http://localhost/login_api_lumen/public/api/kategori-produk/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            kategoriList.value = res.data.data
        } catch (err) {
            console.error('Gagal memuat kategori:', err)
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
        }
    }

    const submitForm = async () => {
        if (!validateForm()) return

        try {
            await axios.post('http://localhost/login_api_lumen/public/api/produk', form.value, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            successMessage.value = '✅ Produk berhasil ditambahkan!'
            errorMessage.value = ''
            form.value = {
                nama_produk: '',
                deskripsi: '',
                harga: '',
                stok: '',
                kategori_id: '',
                satuan_id: ''
            }
            errors.value = {}
        } catch (err) {
            console.error('Gagal menyimpan produk:', err)
            successMessage.value = ''
            errorMessage.value = '❌ Gagal menyimpan data. Silakan cek koneksi atau isi form.'
        }
    }

    const tambahKategori = async () => {
        if (!newKategori.value.trim()) return alert('Nama kategori tidak boleh kosong.')

        try {
            const res = await axios.post('http://localhost/login_api_lumen/public/api/kategori-produk', {
                nama_kategori: newKategori.value
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Tambahkan ke list dan pilih kategori baru
            kategoriList.value.push(res.data)
            form.value.kategori_id = res.data.id

            // Reset form modal
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
    })
</script>

<style scoped>
    .invalid-feedback {
        display: block;
    }
</style>