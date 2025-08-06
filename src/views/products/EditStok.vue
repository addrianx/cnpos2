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
              <h5 class="card-title mb-0">Edit Stok Produk</h5>
            </div>

            <form @submit.prevent="submitStockAdjustment">
              <div class="card-body">
                <div class="row g-3">
                  <!-- Product Info -->
                  <div class="col-md-6">
                    <label class="form-label">Nama Produk</label>
                    <input type="text" class="form-control" v-model="product.nama_produk" readonly>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Stok Saat Ini</label>
                    <input type="number" class="form-control" v-model="product.stok" readonly>
                  </div>

                  <!-- Stock Adjustment -->
                  <div class="col-md-6">
                    <label class="form-label">Tipe Perubahan</label>
                    <select class="form-select" v-model="stockAdjustment.tipe" :disabled="isLoading">
                      <option value="masuk">Stok Masuk</option>
                      <option value="keluar">Stok Keluar</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Jumlah</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model.number="stockAdjustment.jumlah" 
                      min="1"
                      :class="{ 'is-invalid': errors.jumlah }"
                      :disabled="isLoading"
                    >
                    <div class="invalid-feedback">{{ errors.jumlah }}</div>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Keterangan</label>
                    <textarea 
                      class="form-control" 
                      v-model="stockAdjustment.keterangan" 
                      rows="3" 
                      placeholder="Contoh: Penyesuaian stok, pembelian dari supplier, retur pelanggan"
                      :disabled="isLoading"
                    ></textarea>
                  </div>

                  <!-- Stock History -->
                  <div class="col-12 mt-4">
                    <h6 class="mb-3">Riwayat Perubahan Stok</h6>
                    <div class="table-responsive">
                      <table class="table table-bordered table-hover">
                        <thead class="table-light">
                          <tr>
                            <th>Tanggal</th>
                            <th>Tipe</th>
                            <th>Jumlah</th>
                            <th>Keterangan</th>
                            <th>Admin</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="history in stockHistory" :key="history.id">
                            <td>{{ formatDate(history.created_at) }}</td>
                            <td>
                              <span class="badge" :class="history.tipe === 'masuk' ? 'bg-success' : 'bg-danger'">
                                {{ history.tipe === 'masuk' ? 'Masuk' : 'Keluar' }}
                              </span>
                            </td>
                            <td>{{ history.jumlah }}</td>
                            <td>{{ history.keterangan || '-' }}</td>
                            <td>{{ history.user ? history.user.name : 'System' }}</td>
                          </tr>
                          <tr v-if="stockHistory.length === 0">
                            <td colspan="5" class="text-center">Belum ada riwayat perubahan stok</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer d-flex justify-content-end bg-light border-top">
                <button type="submit" class="btn btn-success" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isLoading ? 'Memproses...' : 'Simpan Perubahan' }}
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
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const productId = route.params.id;

    // State
    const product = ref({
      nama_produk: '',
      stok: 0
    });
    
    const stockAdjustment = ref({
      tipe: 'masuk',
      jumlah: 1,
      keterangan: ''
    });
    
    const stockHistory = ref([]);
    const isLoading = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');
    const errors = ref({});

    // Methods
const loadProductData = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`/api/products/${productId}`);
    const data = response.data;
    
    product.value = {
      nama_produk: data.nama_produk,
      stok: data.stok
    };
    
    stockHistory.value = data.stockHistory || [];
    
    // Reset success dan error message
    successMessage.value = '';
    errorMessage.value = '';
    
  } catch (err) {
    console.error('[loadProductData Error]', err.response?.data || err.message);
    
    // Handle error berdasarkan status code
    if (err.response) {
      switch (err.response.status) {
        case 401: // Unauthorized
          errorMessage.value = 'Sesi telah berakhir. Silakan login kembali.';
          // Interceptor akan handle redirect ke login
          break;
          
        case 403: // Forbidden
          errorMessage.value = 'Anda tidak memiliki izin untuk mengakses data ini.';
          break;
          
        case 404: // Not Found
          errorMessage.value = 'Data produk tidak ditemukan.';
          break;
          
        case 422: // Validation Error
          errorMessage.value = 'Data tidak valid: ' + 
            (err.response.data.errors 
              ? Object.values(err.response.data.errors).join(', ') 
              : err.response.data.message);
          break;
          
        case 500: // Server Error
          errorMessage.value = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
          break;
          
        default:
          errorMessage.value = 'Gagal memuat data produk. Silakan coba lagi.';
      }
    } else if (err.request) {
      // Request dibuat tapi tidak mendapat response
      errorMessage.value = 'Tidak ada respon dari server. Periksa koneksi internet Anda.';
    } else {
      // Error lainnya
      errorMessage.value = 'Terjadi kesalahan saat memuat data produk.';
    }
    
    // Auto-clear error message setelah 5 detik
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
    
  } finally {
    isLoading.value = false;
  }
};

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const submitStockAdjustment = async () => {
      errors.value = {};
      
      // Validasi
      if (!stockAdjustment.value.jumlah || stockAdjustment.value.jumlah < 1) {
        errors.value.jumlah = 'Jumlah harus lebih dari 0';
        return;
      }
      
      if (stockAdjustment.value.tipe === 'keluar' && stockAdjustment.value.jumlah > product.value.stok) {
        errors.value.jumlah = 'Jumlah stok keluar melebihi stok tersedia';
        return;
      }
      
      try {
        isLoading.value = true;
        
        await axios.post(`/api/products/${productId}/adjust-stock`, stockAdjustment.value);
        
        // Refresh data
        await loadProductData();
        
        // Reset form
        stockAdjustment.value = {
          tipe: 'masuk',
          jumlah: 1,
          keterangan: ''
        };
        
        successMessage.value = 'Stok berhasil diperbarui!';
        setTimeout(() => successMessage.value = '', 3000);
      } catch (error) {
        console.error('Error updating stock:', error);
        errorMessage.value = 'Gagal memperbarui stok';
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      loadProductData();
    });

    return {
      product,
      stockAdjustment,
      stockHistory,
      isLoading,
      successMessage,
      errorMessage,
      errors,
      formatDate,
      submitStockAdjustment
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