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
              <h5 class="card-title mb-0">Tambah Stok Produk</h5>
            </div>

            <form @submit.prevent="submitStockAddition">
              <div class="card-body">
                <div class="row g-3">
                  <!-- Product Selection -->
                  <div class="col-md-6">
                    <label class="form-label">Pilih Produk</label>
                    <select 
                      class="form-select" 
                      v-model="selectedProductId"
                      :class="{ 'is-invalid': errors.product_id }"
                      :disabled="isLoading || loadingProducts"
                      @change="onProductChange"
                    >
                      <option value="" disabled>-- Pilih Produk --</option>
                      <option 
                        v-for="product in productList" 
                        :key="product.id" 
                        :value="product.id"
                      >
                        {{ product.nama_produk }} (Stok: {{ product.stok }})
                      </option>
                    </select>
                    <div class="invalid-feedback">{{ errors.product_id }}</div>
                    <div v-if="loadingProducts" class="text-muted small mt-1">
                      Memuat daftar produk...
                    </div>
                  </div>

                  <!-- Product Info -->
                  <div class="col-md-6">
                    <label class="form-label">Stok Saat Ini</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      :value="selectedProduct ? selectedProduct.stok : 0" 
                      readonly
                    >
                  </div>

                  <!-- Stock Addition -->
                  <div class="col-md-6">
                    <label class="form-label">Jumlah Stok Masuk</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model.number="stockAddition.jumlah" 
                      min="1"
                      :class="{ 'is-invalid': errors.jumlah }"
                      :disabled="isLoading || !selectedProductId"
                    >
                    <div class="invalid-feedback">{{ errors.jumlah }}</div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Tanggal Masuk</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="stockAddition.tanggal_masuk"
                      :class="{ 'is-invalid': errors.tanggal_masuk }"
                      :disabled="isLoading"
                    >
                    <div class="invalid-feedback">{{ errors.tanggal_masuk }}</div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Keterangan</label>
                    <textarea 
                      class="form-control" 
                      v-model="stockAddition.keterangan" 
                      rows="3" 
                      placeholder="Contoh: Pembelian dari supplier, retur pelanggan, penyesuaian stok"
                      :disabled="isLoading"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="card-footer d-flex justify-content-end bg-light border-top">
                <button 
                  type="submit" 
                  class="btn btn-success" 
                  :disabled="isLoading || !selectedProductId"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isLoading ? 'Memproses...' : 'Simpan Stok' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    // State
    const productList = ref([]);
    const selectedProductId = ref('');
    const selectedProduct = ref(null);
    const loadingProducts = ref(false);
    const isLoading = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');
    const errors = ref({});
    const token = localStorage.getItem('token')

    const stockAddition = ref({
      jumlah: 1,
      tanggal_masuk: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
      keterangan: ''
    });

    // Methods
    const api = axios.create({
    baseURL: 'http://localhost/login_api_lumen/public/api',
    })

    const loadProducts = async () => {
    try {
        loadingProducts.value = true;
        const response = await api.get('/all_produk', {
        headers: {
            Authorization: `Bearer ${token}`
          },
        params: {
            stock_only: true // Parameter tambahan untuk filter
        }
        });
        
        // Sesuaikan dengan struktur response API Anda
        productList.value = response.data.data || [];
        
        // Reset pesan error jika sebelumnya ada
        errorMessage.value = '';
        
    } catch (err) {
        handleError(err, 'Gagal memuat daftar produk');
    } finally {
        loadingProducts.value = false;
    }
    };

    const onProductChange = () => {
      selectedProduct.value = productList.value.find(
        product => product.id == selectedProductId.value
      );
    };

    const submitStockAddition = async () => {
      errors.value = {};
      
      // Validasi
      if (!selectedProductId.value) {
        errors.value.product_id = 'Pilih produk terlebih dahulu';
        return;
      }
      
      if (!stockAddition.value.jumlah || stockAddition.value.jumlah < 1) {
        errors.value.jumlah = 'Jumlah harus lebih dari 0';
        return;
      }
      
      if (!stockAddition.value.tanggal_masuk) {
        errors.value.tanggal_masuk = 'Tanggal masuk harus diisi';
        return;
      }
      
      try {
        isLoading.value = true;
        
        await axios.post(`/api/products/${selectedProductId.value}/add-stock`, {
          ...stockAddition.value,
          tipe: 'masuk' // Default untuk halaman tambah stok
        });
        
        // Refresh data produk
        await loadProducts();
        
        // Reset form
        stockAddition.value = {
          jumlah: 1,
          tanggal_masuk: new Date().toISOString().split('T')[0],
          keterangan: ''
        };
        
        successMessage.value = 'Stok berhasil ditambahkan!';
        setTimeout(() => successMessage.value = '', 3000);
      } catch (error) {
        handleError(error, 'Gagal menambahkan stok');
      } finally {
        isLoading.value = false;
      }
    };

    const handleError = (err, defaultMessage) => {
      console.error('[Error]', err.response?.data || err.message);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage.value = 'Sesi telah berakhir. Silakan login kembali.';
            break;
          case 403:
            errorMessage.value = 'Anda tidak memiliki izin untuk melakukan operasi ini.';
            break;
          case 422:
            errorMessage.value = defaultMessage + ': ' + 
              (err.response.data.errors 
                ? Object.values(err.response.data.errors).join(', ') 
                : err.response.data.message);
            break;
          case 500:
            errorMessage.value = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
            break;
          default:
            errorMessage.value = defaultMessage;
        }
      } else if (err.request) {
        errorMessage.value = 'Tidak ada respon dari server. Periksa koneksi internet Anda.';
      } else {
        errorMessage.value = defaultMessage;
      }
      
      setTimeout(() => errorMessage.value = '', 5000);
    };

    // Lifecycle hooks
    onMounted(() => {
      loadProducts();
    });

    return {
      productList,
      selectedProductId,
      selectedProduct,
      loadingProducts,
      isLoading,
      successMessage,
      errorMessage,
      errors,
      stockAddition,
      onProductChange,
      submitStockAddition
    };
  }
};
</script>

<style scoped>
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
  z-index: 1000;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}
</style>