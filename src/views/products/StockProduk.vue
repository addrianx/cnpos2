<template>
  <div class="content-wrapper">
    <div class="container-fluid container-xl mt-3">
      <!-- Header dan Filter -->
      <div class="row mb-4">
        <div class="col-md-8">
          <h2 class="mb-0">Manajemen Stok Produk</h2>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Cari produk..." v-model="searchQuery">
            <button class="btn btn-outline-secondary" type="button">
              <i class="fa fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Card Utama -->
      <div class="card shadow-sm border-0">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Daftar Stok Produk</h5>
          <div>
            <button class="btn btn-sm btn-primary me-2">
              <i class="fa fa-file-export me-1"></i> Export
            </button>
            <router-link to="/dashboard/tambah-stok" class="btn btn-sm btn-success">
              <i class="fa fa-plus me-1"></i> Tambah Stok
            </router-link>
          </div>
        </div>

        <div class="card-body">
          <!-- Tabel Stok -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th width="50px">No</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Stok Total</th>
                  <th>Satuan</th>
                  <th>Terakhir Update</th>
                  <th width="120px">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <!-- Data Hardcoded -->
                  <tr v-for="(product, index) in paginatedProducts" :key="product.id">
                    <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                    <td>{{ product.nama_produk }}</td>
                    <td>{{ product.kategori }}</td>
                    <td>
                      <span :class="{
                        'text-success': getStokAkhir(product) > 10,
                        'text-warning': getStokAkhir(product) <= 10 && getStokAkhir(product) > 0,
                        'text-danger': getStokAkhir(product) <= 0
                      }">
                        {{ getStokAkhir(product) }}
                      </span>
                    </td>
                    <td>{{ product.satuan }}</td>
                    <td>{{ product.terakhir_update }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger">
                        <i class="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  </tbody>
            </table>
          </div>

          <!-- Card Summary Stok -->
          <div class="row mt-4">
            <div class="col-md-3 mb-3">
              <div class="card border-start border-primary border-4">
                <div class="card-body">
                  <h6 class="text-muted">Total Produk</h6>
                  <h3 class="mb-0">24</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-start border-success border-4">
                <div class="card-body">
                  <h6 class="text-muted">Stok Tersedia</h6>
                  <h3 class="mb-0">{{ totalStokKeseluruhan() }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-start border-warning border-4">
                <div class="card-body">
                  <h6 class="text-muted">Hampir Habis</h6>
                  <h3 class="mb-0">{{ cariStokHampirHabis(item) }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-start border-danger border-4">
                <div class="card-body">
                  <h6 class="text-muted">Stok Kosong</h6>
                  <h3 class="mb-0">{{ getStokKosong() }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
    <div class="d-flex justify-content-center justify-content-lg-end align-items-center p-4 mt-4">
      <div class="btn-group">
        <button class="btn btn-outline-primary btn-sm"
                :disabled="currentPage === 1"
                @click="currentPage--">
          «
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          class="btn btn-sm"
          :class="page === currentPage ? 'btn-primary' : 'btn-outline-primary'"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button class="btn btn-outline-primary btn-sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++">
          »
        </button>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script>
import axiosInstance from '@/utils/axiosInstance';

export default {
  data() {
    return {
      searchQuery: '',
      products: [],
          currentPage: 1,
    perPage: 5, // jumlah item per halaman
    };
  },

  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const name = product.nama_produk?.toLowerCase() || '';
        const category = product.kategori?.toLowerCase() || '';
        return name.includes(this.searchQuery.toLowerCase()) || category.includes(this.searchQuery.toLowerCase());
      });
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.perPage);
    }
  },

  methods: {
    async loadStokProduk() {
      try {
        const response = await axiosInstance.get('/stok-produk');
        this.products = response.data.data || [];
        console.log(this.products)
      } catch (error) {
        console.error('Gagal memuat data stok produk:', error);
      }
    },
    getStokAkhir(product) {
        const stokAwal = Number(product.stok_akhir) || 0;
        const totalMasuk = Number(product.total_masuk) || 0;
        const totalKeluar = Number(product.total_keluar) || 0;

        return stokAwal + totalMasuk - totalKeluar;
      },
    totalStokKeseluruhan() {
    return this.products.reduce((total, product) => {
      const stokAkhir = this.getStokAkhir(product);
      return total + stokAkhir;
    }, 0);
  },
    cariStokHampirHabis() {
    return this.products.filter(product => {
      return this.getStokAkhir(product) <= 10;
    }).length;
  },
  getStokKosong() {
  return this.products.filter(product => {
    return this.getStokAkhir(product) === 0;
  }).length;
},

    goToEditStok(id) {
      this.$router.push(`/dashboard/edit-stok/${id}`);
    }
  },

  mounted() {
    this.loadStokProduk();
  }
};
</script>


<style scoped>
  .card {
    border-radius: 0.5rem;
  }

  .table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
  }

  .border-4 {
    border-width: 4px !important;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
  }

  .pagination button {
    margin: 0;
    padding: 6px 12px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
    border-radius: 4px;
  }

  .pagination .active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
</style>