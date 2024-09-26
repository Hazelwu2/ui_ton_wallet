<template>
  <div>驗證登入中...</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
// Utils
import message from '@/utils/message'
import { handleResponse } from '@/utils/axios/resUtils'
// Pinia
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useDialogStore } from '@/stores/dialog'
// Type
import type { PlayerRegisterResponse } from '@/api/player'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'

// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()
const { handleRegister } = userStore
const { showAlert } = dialogStore
const { lobby_url } = storeToRefs(userStore)

const tg = window.Telegram.WebApp
// 使用 initData 來抓取詳細的用戶資訊
const initData = tg.initData

onMounted(async () => {
  console.error('tg', tg)
  console.error('initData', initData)

  // 擷取 tg.initData 的用戶資訊
  const userData = {
    id: initData.user?.id || '', // Telegram User ID
    first_name: initData.user?.first_name || '', // Telegram User First Name
    username: initData.user?.username || '', // Telegram Username
    photo_url: initData.user?.photo_url || '', // 用戶的頭像 URL
    auth_date: initData.auth_date || '' // 認證時間
  }

  console.log('userData', userData)

  // 使用從 initData 中獲取的 userData 來進行註冊或登入
  const res = (await handleRegister({
    id: userData.id,
    first_name: userData.first_name,
    username: userData.username,
    photo_url: userData.photo_url,
    auth_date: userData.auth_date
  } as TelegramUserData)) as PlayerRegisterResponse

  handleResponse(res, loginSuccess, loginFail)
})
const loginSuccess = () => {
  showAlert({
    icon: 'done',
    text: message.login.success
  })
  if (
    window &&
    window.location &&
    lobby_url &&
    lobby_url.value
  ) {
    window.location.href = lobby_url.value
  }
}

const loginFail = () => {
  showAlert({
    icon: 'fail',
    text: '登入失败，请重新透过 Telegram 机器人登入'
  })
}
</script>
