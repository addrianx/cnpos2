<style>
/* Custom perkuat untuk NProgress */
#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  background: #29d; /* Warna biru */
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transition: all 0.3s ease;
}
</style>

<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>


<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Import layout komponen
import AppLayout from './layouts/AppLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'

const route = useRoute()

const layoutComponent = computed(() => {
  if (route.meta.layout === 'blank') return BlankLayout
  return AppLayout
})
</script>
