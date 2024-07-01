<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { useDialogStore } from '@/stores/dialog'
import { storeToRefs } from 'pinia'
import { loadTelegramWidget } from '@/utils/telegram/telegramLogin'
import { handleResponse } from '@/utils/axios/apiUtils'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'

// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()

const { isLogin, account, balance, ton_wallet } = storeToRefs(userStore)

const {
  handleRegister,
  handleLogin,
  handleDeposit,
  handleWithdraw,
  handleProfile,
  handleLogout
} = userStore

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
      if (!data) {
        console.error('呼叫 Telegram 發生錯誤')
        throw new Error('telegramLogin Fn 發生錯誤：Telegram data 沒有回來')
      }

      // 註冊
      const res = await userStore.handleRegister(data)
      handleResponse(res, loginSuccess, loginFail)
    }
  )
}

const loginSuccess = () => {
  dialogStore.showAlert({
    icon: 'done',
    text: '登入成功'
  })
}

const loginFail = () => {
  dialogStore.showAlert({
    icon: 'fail',
    text: '失敗'
  })
}
</script>

<template>
  <v-container class="d-flex justify-space-between">
    <v-row justify="space-around">
      <!-- 未登入 -->

      <!-- Telegram 按鈕會被動態載入並插入在這 -->
      <div
        v-if="!isLogin"
        id="telegram-login-container"
        class="align-center d-none"
      ></div>
      <div v-if="!isLogin">
        <div @click="telegramLogin" class="cursor-pointer">
          <div color="dark-text">您还未登录</div>
          <br />
          <div color="light-text">
            <v-icon>mdi-login</v-icon>
            登录
            <span>/</span>
            註冊後查看
          </div>
        </div>
      </div>

      <!-- 已登入 -->
      <v-row v-if="isLogin" justify="space-around">
        <!-- 左邊 -->
        <v-col>
          <v-chip @click="handleDeposit">{{ account }}</v-chip>
          <v-chip>{{ balance }}</v-chip>
          <v-chip>{{ ton_wallet }}</v-chip>
        </v-col>

        <!-- 右邊 -->
        <v-col>
          <v-btn color="success">完成</v-btn>
          <v-btn color="error">失败</v-btn>
          <v-btn @click="handleDeposit">
            <v-icon>mdi-currency-usd</v-icon>
            存款
          </v-btn>
          <v-btn @click="handleWithdraw">
            <v-icon>mdi-bank-transfer</v-icon>
            取款
          </v-btn>
          <v-btn @click="handleProfile">
            <v-icon>mdi-account-circle-outline</v-icon>
            個人資料
          </v-btn>
          <v-btn @click="handleLogout">
            <v-icon>mdi-logout</v-icon>
            登出
          </v-btn>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>
