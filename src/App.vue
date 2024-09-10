<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { loadTelegramWidget } from '@/utils/telegram/telegramLogin'

onMounted(() => {
  // 載入 Telegram 第三方登入
  loadTelegramWidget()
})
</script>

<template>
  <!-- Telegram 按鈕會被動態載入並插入在這 -->
  <div
    id="telegram-login-container"
    class="align-center d-none"
  />
  <RouterView />
</template>

<style scoped>
.logo {
  display: block;
  margin: 0 auto 2rem;
}
</style>
