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
                <!-- Form diskon -->
                <div class="form-group mt-3">
                <label for="discount">Diskon</label>
                <div class="d-flex">
                    <input
                    id="discount"
                    type="number"
                    class="form-control"
                    v-model="discount"
                    :disabled="!isDiscountUnlocked"
                    placeholder="Masukkan diskon (%)"
                    />
                    <button
                    class="btn btn-warning ms-2"
                    v-if="!isDiscountUnlocked"
                    @click="showDiscountAuth = true"
                    >
                    🔒 Buka
                    </button>
                    <button
                    class="btn btn-secondary ms-2"
                    v-else
                    @click="lockDiscount"
                    >
                    🔒 Kunci
                    </button>
                </div>
                </div>

                <!-- Modal Password -->
                <div
                class="modal fade"
                tabindex="-1"
                :class="{ show: showDiscountAuth }"
                style="display: block;"
                v-if="showDiscountAuth"
                >
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Masukkan Password</h5>
                        <button type="button" class="btn-close" @click="showDiscountAuth = false"></button>
                    </div>
                    <div class="modal-body">
                        <input
                        type="password"
                        class="form-control"
                        v-model="discountPassword"
                        placeholder="Password"
                        />
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="showDiscountAuth = false">Batal</button>
                        <button class="btn btn-primary" @click="unlockDiscount">OK</button>
                    </div>
                    </div>
                </div>
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
import { ref, computed } from 'vue';

const searchQuery = ref('');
const searchCustomer = ref('');
const showCustomerDropdown = ref(false);
const selectedCustomer = ref(null);
const showAddCustomerModal = ref(false);
const discount = ref(0);

const customers = ref([
  { id: 1, name: 'Adi Nugraha', phone: '08123456789', address: 'Bandung' },
  { id: 2, name: 'Budi Santoso', phone: '08198765432', address: 'Jakarta' },
  { id: 3, name: 'Citra Dewi', phone: '08211222333', address: 'Surabaya' },
]);

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

const saveNewCustomer = () => {
  if (!newCustomer.value.name) return alert("Nama wajib diisi!");
  const id = customers.value.length + 1;
  const cust = { id, ...newCustomer.value };
  customers.value.push(cust);
  selectedCustomer.value = cust;
  searchCustomer.value = cust.name;
  newCustomer.value = { name: '', phone: '', address: '' };
  showAddCustomerModal.value = false;
};

const products = ref([
  { id: 1, name: 'Kopi Susu', price: 25000 },
  { id: 2, name: 'Roti Bakar', price: 15000 },
  { id: 3, name: 'Teh Tarik', price: 20000 },
]);

const cart = ref([]);

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

const addToCart = (product) => {
  const existing = cart.value.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
};

const increaseQuantity = (item) => item.quantity++;
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart.value = cart.value.filter(i => i.id !== item.id);
  }
};

const grandTotal = computed(() => {
  let total = totalPrice.value - discount.value;
  return total < 0 ? 0 : total; // jaga-jaga kalau diskon lebih besar dari subtotal
});

const formatRupiah = (num) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

const processTransaction = () => {
  console.log("Proses pembayaran:", selectedCustomer.value, cart.value, totalPrice.value);
};

// Script setup
const isDiscountUnlocked = ref(false)
const showDiscountAuth = ref(false)
const discountPassword = ref('')

const unlockDiscount = () => {
  if (discountPassword.value === '1234') { // ganti dengan password rahasia
    isDiscountUnlocked.value = true
    showDiscountAuth.value = false
    discountPassword.value = ''
  } else {
    alert('Password salah!')
  }
}

const lockDiscount = () => {
  isDiscountUnlocked.value = false
  discount.value = 0
}
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