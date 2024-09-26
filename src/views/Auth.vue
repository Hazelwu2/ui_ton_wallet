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
const initData = tg.initData

onMounted(async () => {
  const urlParams = new URLSearchParams(
    window.location.search
  )

  console.error('tg', tg)
  console.error('initData', initData)

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
  const res = (await handleRegister({
    id: userData.id,
    first_name: userData.first_name,
    username: userData.username,
    photo_url: userData.photo_url
    // 添加其他必要的屬性
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
