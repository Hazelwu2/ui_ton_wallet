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

interface User {
  id?: string
  first_name?: string
  username?: string
  photo_url?: string
  auth_date?: string
}

onMounted(async () => {
  console.error('tg', tg)
  console.error('initData', initData)
  // 解析 initData 作為 URL 查詢字串
  const urlParams = new URLSearchParams(initData)

  // 解析 user 資訊，因為它是 URL 編碼的 JSON 字串
  const userString = urlParams.get('user')
  let user: User = {}

  if (userString) {
    try {
      user = JSON.parse(userString)
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }

  console.log('user', user)
  console.log('user.auth_date', user.auth_date)

  // 擷取 initData 中的用戶資訊
  const userData = {
    id: user?.id || '',
    first_name: user?.first_name || '',
    username: user?.username || '',
    photo_url: user.photo_url ?? '', // 用戶的頭像 URL (可能需要補充)
    auth_date: urlParams.get('auth_date') ?? '' // 認證時間
  }

  console.log('userData', userData)

  // 使用從 initData 中獲取的 userData 來進行註冊或登入
  const res = (await handleRegister({
    id: userData.id,
    first_name: userData.first_name,
    username: userData.username,
    photo_url: userData.photo_url
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
