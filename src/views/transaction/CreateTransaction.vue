<template>
<div class="content-wrapper">


  <div class="col-12 grid-margin stretch-card">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">Transaksi POS</h4>
        <p class="card-description">Pilih pelanggan dan produk untuk memulai transaksi</p>

        <!-- Pencarian pelanggan -->
        <div class="form-group position-relative">
        <label for="searchCustomer">Cari Pelanggan</label>
        <input
            id="searchCustomer"
            type="text"
            v-model="searchCustomer"
            class="form-control pe-5"
            placeholder="Ketik nama pelanggan..."
            @input="filterCustomers"
        />

        <!-- Tombol X untuk clear input -->
        <span
        v-if="searchCustomer"
        class="clear-icon"
        @click="clearCustomerSearch"
        >
        &times;
        </span>

        <!-- Dropdown suggestion -->
        <ul
            v-if="showCustomerDropdown"
            class="list-group position-absolute w-100"
            style="z-index: 1000;"
        >
            <li
            v-for="cust in filteredCustomers"
            :key="cust.id"
            class="list-group-item list-group-item-action"
            @click="selectCustomer(cust)"
            >
            {{ cust.name }} - {{ cust.phone }}
            </li>

            <!-- Tombol tambah pelanggan selalu muncul -->
            <li
            class="list-group-item list-group-item-action text-primary"
            style="cursor: pointer;"
            @click="showAddCustomerModal = true"
            >
            ➕ Tambah Pelanggan Baru
            </li>
        </ul>
        </div>


        <div v-if="selectedCustomer" class="alert alert-info p-2">
          <strong>Pelanggan:</strong> {{ selectedCustomer.name }} ({{ selectedCustomer.phone }})
        </div>

        <!-- Daftar produk & keranjang -->
        <div class="row">
          <!-- Produk -->
          <div class="col-md-8">
            <div class="form-group">
              <label for="searchProduct">Cari Produk</label>
              <input
                id="searchProduct"
                type="text"
                v-model="searchQuery"
                class="form-control"
                placeholder="Ketik nama produk..."
              />
            </div>

            <div class="row" style="max-height: 500px; overflow-y: auto;">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="col-sm-6 col-md-4 mb-3"
              >
                <div
                  class="border p-3 rounded h-100 d-flex flex-column justify-content-between"
                  style="cursor: pointer;"
                  @click="addToCart(product)"
                >
                  <h6 class="mb-2">{{ product.name }}</h6>
                  <p class="text-muted mb-0">Stok : {{ product.stock }}</p>
                  <p class="text-muted mb-0">{{ formatRupiah(product.price) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Keranjang -->
          <div class="col-md-4">
            <h5 class="mb-3">Keranjang</h5>
            <div v-if="cart.length === 0" class="text-muted text-center my-4">
              Keranjang kosong
            </div>
            <div
              v-for="item in cart"
              :key="item.id"
              class="border p-2 rounded mb-2 d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{{ item.name }}</strong>
                <div class="text-muted" style="font-size: 0.85rem;">
                  {{ formatRupiah(item.price) }} x {{ item.quantity }}
                </div>
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-secondary" @click.stop="decreaseQuantity(item)">-</button>
                <span class="btn btn-light">{{ item.quantity }}</span>
                <button class="btn btn-secondary" @click.stop="increaseQuantity(item)">+</button>
              </div>
            </div>

            <!-- Total -->
            <div class="border-top pt-3 mt-3">
              <div class="d-flex justify-content-between">
                <span>Subtotal</span>
                <strong>{{ formatRupiah(totalPrice) }}</strong>
              </div>
            <div class="d-flex justify-content-between align-items-center">
            <span>Diskon</span>
            <input
                type="number"
                v-model.number="discount"
                class="form-control form-control-sm w-50 text-end"
                min="0"
                :max="totalPrice"
            />
            </div>
              <hr />
              <div class="d-flex justify-content-between">
                <span>Total</span>
                <strong class="text-primary">{{ formatRupiah(grandTotal) }}</strong>
              </div>
              <button
                class="btn btn-primary w-100 mt-3"
                :disabled="cart.length === 0 || !selectedCustomer"
                @click="processTransaction"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Pelanggan -->
    <div
      class="modal fade"
      tabindex="-1"
      :class="{ show: showAddCustomerModal }"
      style="display: block;"
      v-if="showAddCustomerModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Pelanggan Baru</h5>
            <button type="button" class="btn-close" @click="showAddCustomerModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-2">
              <label>Nama</label>
              <input type="text" v-model="newCustomer.name" class="form-control" />
            </div>
            <div class="form-group mb-2">
              <label>No HP</label>
              <input type="text" v-model="newCustomer.phone" class="form-control" />
            </div>
            <div class="form-group mb-2">
              <label>Alamat</label>
              <textarea v-model="newCustomer.address" class="form-control"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddCustomerModal = false">Batal</button>
            <button class="btn btn-primary" @click="saveNewCustomer">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted  } from 'vue';
import axiosInstance from '@/utils/axiosInstance'
import Swal from 'sweetalert2'

const products = ref([])
const cart = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('');
const searchCustomer = ref('');
const showCustomerDropdown = ref(false);
const selectedCustomer = ref(null);
const showAddCustomerModal = ref(false);
const discount = ref(0);

const customers = ref([]) // kosong dulu, nanti diisi dari API

const filteredCustomers = ref([]);

const filterCustomers = () => {
  if (!searchCustomer.value) {
    filteredCustomers.value = [];
    showCustomerDropdown.value = false;
    return;
  }
  filteredCustomers.value = customers.value.filter(c =>
    c.name.toLowerCase().includes(searchCustomer.value.toLowerCase())
  );
  showCustomerDropdown.value = true;
};

const selectCustomer = (cust) => {
  selectedCustomer.value = cust;
  searchCustomer.value = cust.name;
  showCustomerDropdown.value = false;
};

const clearCustomerSearch = () => {
  searchCustomer.value = "";
  filteredCustomers.value = [];
  showCustomerDropdown.value = false;
};

const newCustomer = ref({ name: '', phone: '', address: '' });

const saveNewCustomer = async () => {
  if (!newCustomer.value.name) {
    Swal.fire('Error', 'Nama wajib diisi!', 'warning');
    return;
  }

  try {
    loading.value = true;
    const payload = {
      name: newCustomer.value.name,
      phone: newCustomer.value.phone,
      address: newCustomer.value.address,
    };

    const res = await axiosInstance.post('/customer', payload);

    if (res.data?.status === 'success') {
      Swal.fire('Berhasil', 'Pelanggan baru berhasil ditambahkan.', 'success');

      // Ambil ulang list pelanggan dari API agar data terbaru
      await fetchCustomers();

      // Pilih customer yang baru ditambahkan, asumsikan backend mengembalikan data customer baru di res.data.data
      if (res.data.data) {
        selectedCustomer.value = {
          id: res.data.data.id,
          name: res.data.data.name,
          phone: res.data.data.phone,
          address: res.data.data.address,
        };
        searchCustomer.value = res.data.data.name;
      }

      // Reset form dan tutup modal
      newCustomer.value = { name: '', phone: '', address: '' };
      showAddCustomerModal.value = false;
    } else {
      Swal.fire('Error', 'Gagal menambahkan pelanggan baru.', 'error');
    }
  } catch (err) {
    Swal.fire('Error', err.message || 'Terjadi kesalahan saat menambah pelanggan.', 'error');
  } finally {
    loading.value = false;
  }
};

// Fetch Customers from API
const fetchCustomers = async () => {
  try {
    const res = await axiosInstance.get('/customers');
    if (res.data?.status === 'success' && Array.isArray(res.data.data?.data)) {
      customers.value = res.data.data.data.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        address: item.address,
      }));
    } else {
      Swal.fire('Error', 'Data pelanggan tidak valid', 'error');
    }
  } catch (err) {
    Swal.fire('Error', err.message || 'Gagal memuat pelanggan', 'error');
  }
};

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Fetch Products from API
const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axiosInstance.get('/stok-produk')
    if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
      products.value = res.data.data.map(item => ({
        id: item.produk_id,
        name: item.nama_produk,
        price: item.harga || 0, // kalau ada harga
        category: item.kategori,
        unit: item.satuan,
        stock: item.stok_akhir
      }))
    } else {
      error.value = 'Data produk tidak valid'
    }
  } catch (err) {
    error.value = err.message || 'Gagal memuat produk'
  } finally {
    loading.value = false
  }
}

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

const addToCart = (product) => {
  const existing = cart.value.find(item => item.id === product.id);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity++;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Stok terbatas',
        text: `Stok ${product.name} hanya tersisa ${product.stock} item.`,
      });
    }
  } else {
    if (product.stock > 0) {
      cart.value.push({ ...product, quantity: 1 });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Stok kosong',
        text: `Stok ${product.name} kosong.`,
      });
    }
  }
};

const increaseQuantity = (item) => {
  const product = products.value.find(p => p.id === item.id);
  if (!product) return;
  if (item.quantity < product.stock) {
    item.quantity++;
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Stok terbatas',
      text: `Stok ${product.name} hanya tersisa ${product.stock} item.`,
    });
  }
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart.value = cart.value.filter(i => i.id !== item.id);
  }
};

const grandTotal = computed(() => {
  let total = totalPrice.value - discount.value;
  return total < 0 ? 0 : total;
});

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

const processTransaction = () => {
  console.log("Proses pembayaran:", selectedCustomer.value, cart.value, totalPrice.value);
};

onMounted(() => {
  fetchProducts()
  fetchCustomers()
})

</script>


<style scoped>
.clear-icon {
  position: absolute;
  right: 0.75rem; /* jarak dari sisi kanan input */
  top: 65%;
  transform: translateY(-50%);
  font-size: 1.5rem; /* perbesar ukuran */
  font-weight: bolder;
  color: #f30505; /* abu-abu bootstrap */
  cursor: pointer;
  user-select: none;
}
.clear-icon:hover {
  color: #000; /* sedikit gelap saat hover */
}
</style>