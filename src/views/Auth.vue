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

  // 擷取 query 參數
  const queryKeys = [
    'id',
    'first_name',
    'username',
    'photo_url',
    'auth_date'
  ]
  const userData = queryKeys.reduce(
    (acc, key) => {
      acc[key] = urlParams.get(key) || ''
      return acc
    },
    {} as Record<string, string>
  )

  console.log('userData', userData)

  // await handleRegister(userData)
})
</script>
