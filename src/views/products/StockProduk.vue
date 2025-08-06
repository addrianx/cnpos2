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
            <input 
              type="text" 
              class="form-control" 
              placeholder="Cari produk..."
              v-model="searchQuery"
            >
            <button class="btn btn-outline-secondary" type="button">
              <i class="fas fa-search"></i>
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
                  <th>Stok Awal</th>
                  <th>Stok Tersedia</th>
                  <th>Satuan</th>
                  <th>Terakhir Update</th>
                  <th width="120px">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <!-- Data Hardcoded -->
                <tr v-for="(product, index) in filteredProducts" :key="product.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.category }}</td>
                  <td>{{ product.initial_stock }}</td>
                  <td>
                    <span :class="{
                      'text-success': product.current_stock > 10,
                      'text-warning': product.current_stock <= 10 && product.current_stock > 0,
                      'text-danger': product.current_stock <= 0
                    }">
                      {{ product.current_stock }}
                    </span>
                  </td>
                  <td>{{ product.unit }}</td>
                  <td>{{ product.last_updated }}</td>
                  <td>
                    <router-link to="" class="btn btn-sm btn-outline-primary me-1">
                      <i class="fa fa-edit"></i>
                    </router-link>
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
                  <h3 class="mb-0">156</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-start border-warning border-4">
                <div class="card-body">
                  <h6 class="text-muted">Hampir Habis</h6>
                  <h3 class="mb-0">5</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-start border-danger border-4">
                <div class="card-body">
                  <h6 class="text-muted">Stok Kosong</h6>
                  <h3 class="mb-0">2</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
            <div class="d-flex justify-content-center justify-content-lg-end align-items-center p-4 mt-4">
                <div class="btn-group">
                    <button class="btn btn-outline-primary btn-sm" disabled style="cursor: not-allowed">
                    «
                    </button>
                    <button class="btn btn-sm btn-primary" style="cursor: default">
                    1
                    </button>
                    <button class="btn btn-sm btn-outline-primary">
                    2
                    </button>
                    <button class="btn btn-sm btn-outline-primary">
                    3
                    </button>
                    <button class="btn btn-outline-primary btn-sm">
                    »
                    </button>
                </div>
            </div>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  data() {
    return {
      searchQuery: '',
      products: [
        {
          id: 1,
          name: 'Indomie Goreng',
          category: 'Makanan Instan',
          initial_stock: 50,
          current_stock: 32,
          unit: 'dus',
          last_updated: '2023-05-15 14:30'
        },
        {
          id: 2,
          name: 'Aqua Botol 600ml',
          category: 'Minuman',
          initial_stock: 100,
          current_stock: 15,
          unit: 'pcs',
          last_updated: '2023-05-16 09:15'
        },
        {
          id: 3,
          name: 'Minyak Goreng 2L',
          category: 'Sembako',
          initial_stock: 30,
          current_stock: 0,
          unit: 'botol',
          last_updated: '2023-05-14 16:45'
        },
        {
          id: 4,
          name: 'Gula Pasir 1kg',
          category: 'Sembako',
          initial_stock: 40,
          current_stock: 5,
          unit: 'kg',
          last_updated: '2023-05-16 11:20'
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        return product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               product.category.toLowerCase().includes(this.searchQuery.toLowerCase())
      })
    }
  }
}
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