<template>
  <div class="main-panel">
    <div class="content-wrapper">
      <!-- Welcome Section -->
      <div class="row">
        <div class="col-md-12 grid-margin">
          <div class="row">
            <div class="col-12 col-xl-8 mb-4 mb-xl-0">
              <h3 class="font-weight-bold">Welcome {{ userName }}</h3>
              <h6 class="font-weight-normal mb-0">
                All systems are running smoothly! You have 
                <span class="text-primary">{{ unreadAlerts }} unread alerts!</span>
              </h6>
            </div>
            <div class="col-12 col-xl-4">
              <div class="justify-content-end d-flex">
                <div class="dropdown flex-md-grow-1 flex-xl-grow-0">
                  <button class="btn btn-sm btn-light bg-white dropdown-toggle" type="button" 
                          id="dropdownMenuDate2" data-bs-toggle="dropdown">
                    <i class="mdi mdi-calendar"></i> Today ({{ currentDate }})
                  </button>
                  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuDate2">
                    <a class="dropdown-item" href="#">January - March</a>
                    <a class="dropdown-item" href="#">March - June</a>
                    <a class="dropdown-item" href="#">June - August</a>
                    <a class="dropdown-item" href="#">August - November</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div class="row">
        
        <div class="col-12 grid-margin transparent">

          <div class="row">
            <div class="col-12 col-xl-3 col-md-6 mb-4 stretch-card transparent">
              <div class="card card-tale">
                <div class="card-body">
                  <p class="mb-4">Total Produk</p>
                  <p class="fs-30 mb-2">{{ totalProduk }}</p>
                  <p>10.00% (30 days)</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-xl-3 col-md-6 mb-4 stretch-card transparent">
              <div class="card card-dark-blue">
                <div class="card-body">
                  <p class="mb-4">Total Transaksi</p>
                  <p class="fs-30 mb-2">{{ totalTransaksi }}</p>
                  <p>22.00% (30 days)</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-xl-3 col-md-6 mb-4 stretch-card transparent">
              <div class="card card-light-blue">
                <div class="card-body">
                  <p class="mb-4">Jumlah Pelanggan</p>
                  <p class="fs-30 mb-2">{{ totalPelanggan }}</p>
                  <p>2.00% (30 days)</p>
                </div>
              </div>
            </div>
            <div class="col-12 col-xl-3 col-md-6 mb-4 stretch-card transparent">
              <div class="card card-light-danger">
                <div class="card-body">
                  <p class="mb-4">Servis Selesai</p>
                  <p class="fs-30 mb-2">{{ totalServis }}</p>
                  <p>0.22% (30 days)</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Charts Row -->
      <div class="row">
        <div class="col-md-6 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <p class="card-title">Order Details</p>
              <p class="font-weight-500">The total number of sessions within the date range.</p>
              <div class="d-flex flex-wrap mb-5">
                <div class="me-5 mt-3">
                  <p class="text-muted">Order value</p>
                  <h3 class="text-primary fs-30 font-weight-medium">12.3k</h3>
                </div>
                <div class="me-5 mt-3">
                  <p class="text-muted">Orders</p>
                  <h3 class="text-primary fs-30 font-weight-medium">14k</h3>
                </div>
                <div class="me-5 mt-3">
                  <p class="text-muted">Users</p>
                  <h3 class="text-primary fs-30 font-weight-medium">71.56%</h3>
                </div>
                <div class="mt-3">
                  <p class="text-muted">Downloads</p>
                  <h3 class="text-primary fs-30 font-weight-medium">34040</h3>
                </div>
              </div>
              <canvas id="order-chart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <p class="card-title">Sales Report</p>
                <a href="#" class="text-info">View all</a>
              </div>
              <p class="font-weight-500">Sales performance for the current period.</p>
              <div id="sales-chart-legend" class="chartjs-legend mt-4 mb-2"></div>
              <canvas id="sales-chart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="row">
        <div class="col-md-12 grid-margin stretch-card">
          <div class="card">
            <div class="card-body">
              <p class="card-title mb-0">Recent Transactions</p>
              <div class="table-responsive">
                <table class="table table-striped table-borderless">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(transaction, index) in recentTransactions" :key="index">
                      <td>{{ transaction.product }}</td>
                      <td class="font-weight-bold">${{ transaction.price }}</td>
                      <td>{{ transaction.date }}</td>
                      <td class="font-weight-medium">
                        <div :class="`badge badge-${transaction.statusClass}`">{{ transaction.status }}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  setup() {
    const totalProduk = ref(0)
    const totalTransaksi = ref(120) // dummy
    const totalPelanggan = ref(80) // dummy
    const totalServis = ref(45) // dummy
    const token = localStorage.getItem('token')

    const fetchTotalProduk = async () => {
      try {
        const res = await axios.get('http://localhost/login_api_lumen/public/api/all_produk', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        totalProduk.value = res.data.data.length
      } catch (err) {
        console.error('Gagal mengambil total produk:', err)
      }
    }

    onMounted(() => {
      fetchTotalProduk()
    })

    // WAJIB: return semua yang mau dipakai di template
    return {
      totalProduk,
      totalTransaksi,
      totalPelanggan,
      totalServis
    }
  }
}
</script>