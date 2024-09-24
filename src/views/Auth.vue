<template>
  <div>驗證登入中...</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

// Pinia Vuex
const userStore = useUserStore()
const { handleRegister } = userStore

onMounted(async () => {
  const urlParams = new URLSearchParams(
    window.location.search
  )
  console.log('urlParams', urlParams)

  // await handleRegister
})
</script>
