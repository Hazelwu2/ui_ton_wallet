<template>
  <div>驗證登入中...</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'

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

  /*
    {
      "id": "358617252",
      "first_name": "Hazel",
      "username": "heerherw",
      "photo_url": "https://t.me/i/userpic/320/GeahPT2_TZEl-DY82bJ2qc6njc-O3-D2N1ERwJqzN6w.jpg",
      "auth_date": "1727161596"
    }
  */

  console.log('userData', userData)

  await handleRegister({
    id: userData.id,
    first_name: userData.first_name,
    username: userData.username,
    photo_url: userData.photo_url
    // 添加其他必要的屬性
  } as TelegramUserData)
})
</script>
