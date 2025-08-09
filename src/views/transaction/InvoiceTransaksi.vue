<template>
  <div class="content-wrapper">
    <div class="container-fluid container-md mt-3">
      <div class="row">
        <div class="col-lg-12 grid-margin stretch-card">
          <div class="card px-2" id="invoice-card">
            <div class="card-body" v-if="invoice">
              <div class="container-fluid">
                <h3 class="text-right my-5">Invoice&nbsp;&nbsp;#{{ invoice.id }}</h3>
                <hr>
              </div>

              <div class="container-fluid d-flex justify-content-between">
                <div class="col-lg-3 ps-0">
                  <p class="mt-5 mb-2"><b>Skydash Admin</b></p>
                  <p>104,<br>Minare SK,<br>Canada, K1A 0G9.</p>
                </div>
                <div class="col-lg-3 pr-0">
                  <p class="mt-5 mb-2 text-right"><b>Invoice to</b></p>
                  <p class="text-right">{{ invoice.customer.name }},<br> C-201, Beykoz-34800,<br> Canada, K1A 0G9.</p>
                </div>
              </div>

              <div class="container-fluid d-flex justify-content-between">
                <div class="col-lg-3 ps-0">
                  <p class="mb-0 mt-5">Tanggal Invoice: {{ invoice.invoiceDate }}</p>
                  <p>Status: {{ invoice.status }}</p>
                </div>
              </div>

              <div class="container-fluid mt-5 d-flex justify-content-center w-100">
                <div class="table-responsive w-100">
                  <table class="table">
                    <thead class="bg-dark text-white">
                      <tr>
                        <th>#</th>
                        <th>Deskripsi</th>
                        <th class="text-right">Kuantitas</th>
                        <th class="text-right">Harga Satuan</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in invoice.items" :key="index" class="text-right">
                        <td class="text-left">{{ index + 1 }}</td>
                        <td class="text-left">{{ item.description }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ formatRupiah(item.unitCost) }}</td>
                        <td>{{ formatRupiah(item.quantity * item.unitCost) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="container-fluid mt-5 w-100">
                <p class="text-right mb-2">Sub - Total: {{ formatRupiah(invoice.subtotal) }}</p>
                <p class="text-right">Diskon: {{ formatRupiah(invoice.discount) }}</p>
                <h4 class="text-right mb-5">Total: {{ formatRupiah(invoice.total) }}</h4>
                <hr>
              </div>

              <div class="container-fluid w-100 send-print">
                <button class="btn btn-primary float-right mt-4 ms-2" @click="printInvoice('a4')">
                  <i class="ti-printer me-1"></i>Print A4
                </button>
                <button class="btn btn-warning float-right mt-4 ms-2" @click="printInvoice('pos')">
                  <i class="ti-printer me-1"></i>Print POS 58mm
                </button>
                <button class="btn btn-success float-right mt-4" @click="sendInvoice">
                  <i class="ti-export me-1"></i>Send Invoice
                </button>
              </div>
            </div>

            <div class="card-body text-center py-5" v-else>
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const invoice = ref(null);

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

const fetchInvoiceData = () => {
  const mockInvoice = {
    id: 'TRX-12345',
    customer: { name: 'Pelanggan Uji Coba' },
    invoiceDate: '23 Januari 2024',
    status: 'Selesai',
    items: [
      { description: 'Produk A', quantity: 2, unitCost: 50000 },
      { description: 'Produk B', quantity: 1, unitCost: 150000 },
      { description: 'Jasa Desain', quantity: 1, unitCost: 300000 },
    ],
    subtotal: 550000,
    discount: 50000,
    total: 500000
  };
  setTimeout(() => invoice.value = mockInvoice, 500);
};

const printInvoice = (type) => {
  const originalContent = document.body.innerHTML;

  if (type === 'pos') {
    let posHTML = `
      <style>
        @page { size: 58mm auto; margin: 0; }
        body { 
          font-size: 10px; 
          font-family: monospace, 'Courier New', Courier; 
          line-height: 1.2;
        }
        .center {text-align:center;}
        .pos-small {
          font-size: 10px;
          margin: 0;       /* hilangkan jarak atas-bawah */
          padding: 0;      /* hilangkan padding */
          line-height: 1.1; /* rapatin lagi antar baris */
        }
        .header-pos {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding: 0 5px; 
        }
        .item { margin-bottom: 4px; margin-bottom: 1rem; padding: 0 5px; }
        .item-line {
          display: flex;
          justify-content: space-between;
        }
        .subtotal p{
          font-size: 10px;
          padding: 4px 5px; 
        }
        .line {
          border-top: 1px dashed #000;
          margin-top: 0.5rem;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 2px 0; text-align: left; }
        h3, h4, p { margin: 2px 0; }
      </style>

      <div class="head-pos">
      <div class="center"><b>Cipta Nugraha Computer</b></div>
      <div class="center">Jl.Pahlawan Sukagalih</div>
      <div class="center">Tarogong Kidul, Garut</div>
      <div class="center">085624978775</div>
      <div class="line"></div>
      </div>

      <div class="header-pos">
      <p class="pos-small">No Invoice: ${invoice.value.id}</p>
      <p class="pos-small">Tanggal: ${invoice.value.invoiceDate}</p>
      <p class="pos-small">Pelanggan: ${invoice.value.customer.name}</p>
      <div class="line"></div>
      </div>
    `;

    // Tambahkan item
    invoice.value.items.forEach(item => {
      posHTML += `
      <div class="item">
        <div>${item.quantity}x ${item.description}</div>
        <div class="item-line">
          <span>${formatRupiah(item.unitCost).replace("Rp", "").trim()}</span>
          <span>${formatRupiah(item.unitCost * item.quantity).replace("Rp", "").trim()}</span>
        </div>
      </div>
      `;
    });

    posHTML += `
    <div class="subtotal">
      <div class="line"></div>
      <p>Sub - Total: ${formatRupiah(invoice.value.subtotal)}</p>
      <p>Diskon: ${formatRupiah(invoice.value.discount)}</p>
      <p><b>Total: ${formatRupiah(invoice.value.total)}</b></p>
      <div class="line"></div>
      <div class="center">Terima kasih!</div>
    </div>
    `;

    document.body.innerHTML = posHTML;
  } else {
    document.body.innerHTML = document.getElementById('invoice-card').innerHTML;
  }

  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload();
};

const sendInvoice = () => {
    alert('Invoice berhasil dikirim!');
};

onMounted(fetchInvoiceData);
</script>

<style scoped>
@media print {
  body * {
    display: none !important;
  }
  #invoice-card,
  #invoice-card * {
    display: block !important;
    visibility: visible !important;
  }
  #invoice-card {
    box-shadow: none !important;
  }
  #invoice-card .send-print {
    display: none !important;
  }
}
</style>
