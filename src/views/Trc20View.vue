<script setup lang="ts">
// Component
import AppNavbar from '@/components/AppNavbar.vue'
// Utils
import { handleResponse } from '@/utils/axios/resUtils'
import message from '@/utils/message'
// Dialog
import Alert from '@/components/Dialog/ShowAlert.vue'
import DepositDialog from '@/components/Dialog/DepositDialog.vue'
import WithdrawalDialog from '@/components/Dialog/WithdrawalDialog.vue'
import ProfileDialog from '@/components/Dialog/ProfileDialog.vue'
// Pinia
import { storeToRefs } from 'pinia'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
// Type
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'
import type { PlayerRegisterResponse } from '@/api/player'

const dialogStore = useDialogStore()
const userStore = useUserStore()

const { isLogin, lobby_url } = storeToRefs(userStore)
const { showAlert } = dialogStore

const { showDepositDialog, showWithdrawalDialog } =
  storeToRefs(dialogStore)

const telegramLogin = async () => {
  window.Telegram.Login.auth(
    {
      bot_id: import.meta.env.VITE_TELEGRAM_BOT_ID,
      request_access: 'write',
      embed: 1
    },
    async (data: TelegramUserData | undefined) => {
      if (!data) {
        throw new Error(
          'telegramLogin Fn 發生錯誤：Telegram data 沒有回來'
        )
      }

      // 註冊
      const res = (await userStore.handleRegister(
        data
      )) as PlayerRegisterResponse
      handleResponse(res, loginSuccess, loginFail)
    }
  )
}

const loginSuccess = () => {
  showAlert({
    icon: 'done',
    text: message.login.success
  })
}

const loginFail = () => {
  showAlert({
    icon: 'fail',
    text: '失敗'
  })
}
</script>

<template>
  <main>
    <div class="container">
      <Alert
        class="alert"
        :dialog="dialogStore.alertStatus"
        :icon="dialogStore.icon"
        :text="dialogStore.text"
      />
      <!-- <AppNavbar /> -->

      <!-- 存款、取款、個人資料燈箱 Start -->
      <!-- <v-dialog v-model="showDepositDialog" max-width="600">
        <DepositDialog />
      </v-dialog>

      <v-dialog
        v-model="showWithdrawalDialog"
        max-width="600"
      >
        <WithdrawalDialog />
      </v-dialog>

      <v-dialog
        v-model="dialogStore.showProfileDialog"
        max-width="600"
      >
        <ProfileDialog />
      </v-dialog> -->
      <!-- 存款、取款、個人資料燈箱 End -->

      <iframe v-if="isLogin" :src="lobby_url" />
      <div class="please-login" v-else>
        点击下方按钮登录，随后请在 Telegram 中确认授权。
        <div>
          <v-btn
            rounded="xl"
            class="mr-4"
            @click="telegramLogin"
          >
            <v-icon>mdi-arrow-up-thin</v-icon>
            登录
          </v-btn>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Fill the entire viewport height */
}
.please-login {
  padding: 20px;
  text-align: center;
  border: 1px solid;
}

iframe {
  flex: 1; /* Take up remaining space */
  border: none; /* Optional: remove border */
}
</style>
