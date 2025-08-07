import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import AppFooter from './components/AppFooter.vue'

import './assets/vendors/feather/feather.css'
import './assets/vendors/ti-icons/css/themify-icons.css'
import './assets/vendors/css/vendor.bundle.base.css'
import './assets/vendors/font-awesome/css/font-awesome.min.css'

const app = createApp(App)

app.component('AppFooter', AppFooter)
app.use(router)
app.mount('#app')

