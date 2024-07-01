<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { loadTelegramWidget } from '@/utils/telegram/telegramLogin'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'

const userStore = useUserStore()
const { isLogin, account, balance, ton_wallet } = storeToRefs(userStore)

const { handleRegister, handleLogin, handleDeposit, handleWithdraw, handleProfile, handleLogout } =
  userStore

// 全局定义 onTelegramAuth 函数，确保其能被 Telegram 脚本调用
window.onTelegramAuth = (user: TelegramUserData) => {
  userStore.handleRegister(user) // 调用用户登录逻辑
}

onMounted(() => {
  if (!isLogin.value) {
    // 載入 Telegram 第三方登入
    nextTick(() => {
      loadTelegramWidget()
    })
  }
})

const telegramLogin = async () => {
  window.Telegram.Login.auth(
    {
      bot_id: import.meta.env.VITE_TELEGRAM_BOT_ID,
      request_access: 'write',
      embed: 1
    },
    async (data: TelegramUserData) => {
      console.log(data, '这是回调数据')
      if (!data) console.error('呼叫 Telegram 發生錯誤')

      // 註冊
      const res = await userStore.handleRegister(data)
    }
  )
}
</script>

<template>
  <v-container class="d-flex justify-space-between">
    <div>
      <v-chip @click="handleDeposit">{{ account }}</v-chip>
      <v-chip>{{ balance }}</v-chip>
      <v-chip>{{ ton_wallet }}</v-chip>
    </div>

    <v-row justify="space-around">
      <!-- 未登入 -->
      <!-- Telegram 按鈕會被動態載入並插入在這 -->
      <div v-if="!isLogin" id="telegram-login-container" class="align-center d-none"></div>
      <div v-if="!isLogin">
        <v-btn @click="telegramLogin">登入</v-btn>
        <div class="d-flex justify-space-around">
          <v-icon>mdi-home</v-icon>
          <v-icon>mdi-currency-usd</v-icon>
        </div>
      </div>

      <!-- 已登入 -->
      <div v-if="isLogin">
        <v-btn @click="handleDeposit">
          <v-icon>mdi-currency-usd</v-icon>
          存款
        </v-btn>
        <v-btn @click="handleWithdraw">取款</v-btn>
        <v-btn @click="handleProfile">個人資料</v-btn>
        <v-btn @click="handleLogout">登出</v-btn>
      </div>
    </v-row>
  </v-container>
</template>
