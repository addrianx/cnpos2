<template>
  <div class="container-scroller">
    <div class="container-fluid page-body-wrapper full-page-wrapper">
      <div class="content-wrapper d-flex align-items-center auth px-0">
        <div class="row w-100 mx-0">
          <div class="col-lg-4 mx-auto">
            <div class="auth-form-light text-left py-5 px-4 px-sm-5">
              <div class="brand-logo">
                <img src="/images/logo.svg" alt="logo" />
              </div>
              <h4>Hello! let's get started</h4>
              <h6 class="font-weight-light">Sign in to continue.</h6>

              <div v-if="error" class="alert alert-danger mt-3">{{ errorMessage }}</div>
              <div v-if="success" class="alert alert-success mt-3">{{ successMessage }}</div>

              <form @submit.prevent="login">
                <div class="form-group">
                  <input
                    v-model="email"
                    type="email"
                    class="form-control form-control-lg"
                    placeholder="Email"
                    required
                  />
                </div>
                <div class="form-group">
                  <input
                    v-model="password"
                    type="password"
                    class="form-control form-control-lg"
                    placeholder="Password"
                    required
                  />
                </div>
                <div class="mt-3 d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    SIGN IN
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

<script>
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axiosInstance' // Pastikan path sesuai

export default {
  name: 'LoginPage',
  setup() {
    const email = ref('')
    const password = ref('')
    const error = ref(false)
    const errorMessage = ref('')
    const success = ref(false)
    const successMessage = ref('')

    const route = useRoute()
    const router = useRouter()

    watchEffect(() => {
      if (route.query.logout === 'true') {
        success.value = true
        successMessage.value = 'Anda berhasil logout.'
      } else if (route.query.forced === 'true') {
        error.value = true
        errorMessage.value = 'Anda harus login terlebih dahulu untuk mengakses dashboard.'
      }
    })

    const login = async () => {
      error.value = false
      success.value = false

      try {
        const res = await api.post('/login', {
          email: email.value,
          password: password.value
        })

        const data = res.data

        if (data.user && data.token && data.refresh_token) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('token', data.token)
          localStorage.setItem('refresh_token', data.refresh_token)

          success.value = true
          successMessage.value = `Selamat datang, ${data.user.name}`
          await router.push('/dashboard')
        } else {
          throw new Error('Data tidak lengkap dari server')
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Terjadi kesalahan koneksi'
        error.value = true
        errorMessage.value = msg
      }
    }

    return {
      email,
      password,
      error,
      errorMessage,
      success,
      successMessage,
      login
    }
  }
}
</script>
