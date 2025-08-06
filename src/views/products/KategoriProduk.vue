<template>
  <div class="content-wrapper">
  <div class="container mt-3">
  <div class="row">
    <div class="col-lg-12 grid-margin stretch-card">
      <div class="card">
        <div class="card-body">

          <h4 class="card-title mb-3">Atur Kategori Produk</h4>

          <!-- Notifikasi -->
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Tombol Tambah -->
          <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-primary btn-sm" @click="showKategoriModal = true">
              Tambah Kategori
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center my-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <!-- List Kategori -->
          <div v-else>
            <div v-if="kategoriList.length > 0">
              <div 
                v-for="kategori in kategoriList" 
                :key="kategori.id" 
                class="card mb-2 border border-light-subtle shadow-sm"
              >
                <div class="card-body d-flex justify-content-between align-items-center py-2 px-3">
                  <div>{{ kategori.nama_kategori }}</div>
                  <button class="btn btn-sm btn-danger" @click="hapusKategori(kategori.id)">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-muted">Belum ada kategori yang ditambahkan.</div>

            <!-- Pagination -->
            <nav v-if="totalPages > 1" class="mt-4">
              <ul class="pagination justify-content-center mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--">Sebelumnya</button>
                </li>

                <li 
                  class="page-item" 
                  v-for="page in totalPages" 
                  :key="page"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++">Berikutnya</button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Modal Tambah Kategori -->
  <div class="modal fade show d-block" v-if="showKategoriModal"
    style="background-color: rgba(0, 0, 0, 0.5); position: fixed; inset: 0; z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Tambah Kategori</h5>
          <button type="button" class="btn-close" @click="showKategoriModal = false"></button>
        </div>
        <div class="modal-body">
          <input
            v-model="newKategori"
            type="text"
            class="form-control"
            placeholder="Nama kategori baru"
          />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showKategoriModal = false">Batal</button>
          <button class="btn btn-primary" @click="tambahKategori()">Simpan</button>
        </div>
      </div>
    </div>
  </div>

  </div>

  </div>
</template>

<script setup>
  import {
    watch
  } from 'vue'
  import {
    ref,
    computed,
    onMounted
  } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'

  const kategoriList = ref([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(true)

  const showKategoriModal = ref(false)
  const newKategori = ref('')
  const kategoriError = ref('')

  const successMessage = ref('')
  const errorMessage = ref('')

  // ✅ Validasi input kategori
  const isValidKategori = computed(() => /^[A-Za-z]+$/.test(newKategori.value))
  const token = localStorage.getItem('token')

  const fetchKategori = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const res = await axios.get(
        `http://localhost/login_api_lumen/public/api/kategori-produk?page=${currentPage.value}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Backend pagination pakai struktur res.data.data
      if (res.data && res.data.data) {
        kategoriList.value = res.data.data
        totalPages.value = res.data.last_page || 1
      } else {
        kategoriList.value = []
        errorMessage.value = 'Format data tidak dikenali.'
      }

    } catch (err) {
      console.error('❌ Error ambil kategori:', err)
      errorMessage.value = 'Gagal memuat kategori. Token mungkin tidak valid.'
    } finally {
      loading.value = false
    }
  }


  const tambahKategori = async () => {
    kategoriError.value = ''
    const token = localStorage.getItem('token')

    if (!token) {
      errorMessage.value = 'Token tidak ditemukan. Silakan login ulang.'
      return
    }

    if (!newKategori.value.trim()) {
      kategoriError.value = 'Nama kategori tidak boleh kosong.'
      return
    }

    if (!isValidKategori.value) {
      kategoriError.value = 'Kategori hanya boleh huruf saja (tanpa angka/spasi).'
      return
    }

    try {
      await axios.post(
        'http://localhost/login_api_lumen/public/api/kategori-produk', {
          nama_kategori: newKategori.value
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Ubah ke halaman 1 dan fetch ulang dari server
      currentPage.value = 1
      await fetchKategori()

      successMessage.value = '✅ Kategori berhasil ditambahkan!'
      newKategori.value = ''
      showKategoriModal.value = false
    } catch (err) {
      console.error('❌ Gagal tambah kategori:', err)
      errorMessage.value = '❌ Gagal menambahkan kategori.'
    }
  }


const hapusKategori = async (id) => {
  const token = localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Token tidak ditemukan. Silakan login ulang.'
    })
    return
  }

  const result = await Swal.fire({
    title: 'Yakin ingin menghapus?',
    text: 'Kategori ini akan dihapus secara permanen.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (!result.isConfirmed) return

  try {
    await axios.delete(
      `http://localhost/login_api_lumen/public/api/kategori-produk/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    kategoriList.value = kategoriList.value.filter(k => k.id !== id)

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Kategori berhasil dihapus.',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Gagal!',
      text: err.response?.data?.message || 'Gagal menghapus kategori.'
    })
  }
}


  onMounted(fetchKategori)

  watch(currentPage, () => {
    fetchKategori()
  })
</script>



<style scoped>
  .invalid-feedback {
    display: block;
  }
</style>