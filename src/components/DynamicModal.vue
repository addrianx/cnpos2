<template>
  <div class="modal fade d-block" :class="{ show: show }" v-if="show"
    style="background-color: rgba(0, 0, 0, 0.5); position: fixed; inset: 0; z-index: 1050;">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="close" :disabled="loading"></button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close" :disabled="loading">Batal</button>
          <button class="btn btn-primary" @click="confirm" :disabled="loading || disableConfirm">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            {{ loading ? loadingText : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: Boolean,  // Diubah dari modelValue ke show
  title: String,
  loading: Boolean,
  loadingText: {
    type: String,
    default: 'Memproses...'
  },
  confirmText: {
    type: String,
    default: 'Simpan'
  },
  disableConfirm: Boolean
})

const emit = defineEmits(['close', 'confirm']) // Diubah dari update:modelValue ke close

const close = () => {
  emit('close') // Diubah dari update:modelValue ke close
}

const confirm = () => {
  emit('confirm')
}
</script>