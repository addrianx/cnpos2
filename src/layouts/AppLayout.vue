<!-- src/App.vue -->
<template>
    <div class="container-scroller">
      <AppHeader />
      
      
      <div class="container-fluid page-body-wrapper">
        <AppSidebar />
        <router-view />
      </div>
      
    </div>
 
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppSidebar from '../components/AppSidebar.vue'
</script>


