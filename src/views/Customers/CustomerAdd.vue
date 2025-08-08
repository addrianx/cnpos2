<template>
  <div class="content-wrapper">
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

          <!-- Card Form -->
          <div class="card">
            <div class="card-body">
              <h4 class="card-title mb-4">Tambah Customer</h4>

              <form @submit.prevent="submitForm" novalidate>
                <div class="row g-3">
                  <!-- Nama Customer -->
                  <div class="col-md-6">
                    <label class="form-label">Nama Customer <span class="text-danger">*</span></label>
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.name }"
                      placeholder="Masukkan nama customer"
                    />
                    <div class="invalid-feedback">{{ errors.name }}</div>
                  </div>

                  <!-- Email -->
                  <div class="col-md-6">
                    <label class="form-label">Email <span class="text-danger">*</span></label>
                    <input
                      v-model="form.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder="Masukkan email customer"
                    />
                    <div class="invalid-feedback">{{ errors.email }}</div>
                  </div>

                  <!-- Nomor Telepon -->
                  <div class="col-md-6">
                    <label class="form-label">Nomor Telepon <span class="text-danger">*</span></label>
                    <input
                      v-model="form.phone"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.phone }"
                      placeholder="Masukkan nomor telepon"
                    />
                    <div class="invalid-feedback">{{ errors.phone }}</div>
                  </div>

                  <!-- Tanggal Lahir -->
                  <div class="col-md-6">
                    <label class="form-label">Tanggal Lahir</label>
                    <input
                      v-model="form.tanggal_lahir"
                      type="date"
                      class="form-control"
                    />
                  </div>
                </div>

                <!-- Alamat -->
                <div class="col-12">
                <label class="form-label">Alamat</label>
                <textarea
                    v-model="form.address"
                    class="form-control"
                    rows="3"
                    placeholder="Masukkan alamat customer"
                ></textarea>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axiosInstance from '@/utils/axiosInstance' // PAKAI axiosInstance


const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  tanggal_lahir: '' // kalau backend tidak validasi ini, bisa tetap dikirim
})

const errors = ref({})
const successMessage = ref('')
const errorMessage = ref('')

// Validasi sederhana
const validateForm = () => {
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nama customer wajib diisi.'
  }
  if (!form.value.email) {
    errors.value.email = 'Email wajib diisi.'
  }
  if (!form.value.phone) {
    errors.value.phone = 'Nomor telepon wajib diisi.'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    await axiosInstance.post('/customer', form.value) // Tidak perlu set header/token manual

    successMessage.value = 'Customer berhasil ditambahkan!'
    errorMessage.value = ''
    resetForm()

  } catch (err) {
    console.error('Gagal menyimpan customer:', err)
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors || {}
      errorMessage.value = err.response.data.message || 'Periksa kembali form yang diisi.'
    } else {
      errorMessage.value = err.response?.data?.message || 'Terjadi kesalahan.'
    }
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    tanggal_lahir: ''
  }
  errors.value = {}
}
</script>

<style scoped>
.invalid-feedback {
  display: block;
}
</style>
