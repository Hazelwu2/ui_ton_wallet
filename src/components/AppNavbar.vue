<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
// Utils
import { loadTelegramWidget } from '@/utils/telegram/telegramLogin'
import { handleResponse } from '@/utils/axios/resUtils'
import message from '@/utils/message'
// Pinia
import { useUserStore } from '@/stores/user'
import { useDialogStore } from '@/stores/dialog'
import { storeToRefs } from 'pinia'
// Type
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'
import type {
  GetPlayerInfoResponse,
  PlayerRegisterResponse
} from '@/api/player'

// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()
const { isLogin, account, balance } = storeToRefs(userStore)
// Action
const { handleRegister, ifUserIsLogin } = userStore
const { showAlert } = dialogStore

// 全局定义 onTelegramAuth 函数，确保其能被 Telegram 脚本调用
window.onTelegramAuth = (user: TelegramUserData) => {
  handleRegister(user) // 调用用户登录逻辑
}

const isRefreshing = ref(false)

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

const handleDeposit = () => {
  if (!ifUserIsLogin()) {
    showAlert({
      icon: 'fail',
      text: message.auth
    })
    return
  }

  dialogStore.switchDepositDialog()
}

const handleWithdrawal = () => {
  if (!ifUserIsLogin()) {
    showAlert({
      icon: 'fail',
      text: message.auth
    })
    return
  }

  dialogStore.switchWithdrawalDialog()
}

const handleProfile = () => {
  if (!ifUserIsLogin()) {
    showAlert({
      icon: 'fail',
      text: message.auth
    })
    return
  }
  dialogStore.switchProfileDialog()
}

// 點擊登出
const handleLogout = async () => {
  await userStore.handleLogout()
  showAlert({
    icon: 'done',
    text: '登出成功'
  })
}

const getPlayerInfo = async () => {
  isRefreshing.value = true
  try {
    const res =
      (await userStore.getPlayerInfo()) as GetPlayerInfoResponse
    handleResponse(res, getPlayerInfoSuccess)
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

const getPlayerInfoSuccess = () => {
  showAlert({
    icon: 'done',
    text: '更新余额成功'
  })
}
</script>

<template>
  <v-container class="d-flex justify-space-between">
    <v-row class="align-center" justify="space-around">
      <!-- 未登入 -->

      <!-- Telegram 按鈕 Start -->
      <!-- Telegram 按鈕會被動態載入並插入在這 -->
      <div
        v-if="!isLogin"
        id="telegram-login-container"
        class="align-center d-none"
      />
      <!-- Telegram 按鈕 End -->

      <div
        v-if="!isLogin"
        class="is-not-login d-flex align-center"
      >
        <div
          @click="telegramLogin"
          class="cursor-pointer user-area mb-1"
        >
          <div color="dark-text">您还未登录</div>
          <div color="light-text">
            <v-icon>mdi-login</v-icon>
            登录
            <span>/</span>
            注册后查看
          </div>
        </div>

        <div class="ml-4">
          <v-chip
            prepend-icon="mdi-currency-usd"
            variant="outlined"
            size="small"
            @click="handleDeposit"
            class="mr-2"
          >
            存款
          </v-chip>
          <v-chip
            prepend-icon="mdi-bank-transfer"
            variant="outlined"
            size="small"
            @click="handleWithdrawal"
            class="mr-2"
          >
            取款
          </v-chip>
          <v-chip
            prepend-icon="mdi-account-circle-outline"
            variant="outlined"
            size="small"
            @click="handleProfile"
            class="mr-2"
          >
            個人資料
          </v-chip>
        </div>
      </div>

      <!-- 已登入 -->
      <v-row
        v-if="isLogin"
        justify="space-around"
        class="align-center"
      >
        <!-- 左邊 -->
        <v-col>
          <div class="nav-left">
            <v-chip class="mr-2">
              <v-icon class="mr-2">
                mdi-comment-account-outline
              </v-icon>
              {{ account }}
            </v-chip>
            <v-chip>
              <v-icon class="mr-1"
                >mdi-wallet-outline</v-icon
              >
              TON: {{ balance }}
              <v-icon
                :class="{ 'mdi-spin': isRefreshing }"
                @click="getPlayerInfo"
                >mdi-refresh</v-icon
              >
            </v-chip>
          </div>
        </v-col>

        <!-- 右邊 -->
        <v-col align-items="center">
          <div class="nav-right">
            <v-chip
              prepend-icon="mdi-currency-usd"
              variant="outlined"
              size="small"
              color="accent"
              @click="handleDeposit"
              class="mr-2"
            >
              存款
            </v-chip>
            <v-chip
              prepend-icon="mdi-bank-transfer"
              variant="outlined"
              size="small"
              color="accent"
              @click="handleWithdrawal"
              class="mr-2"
            >
              取款
            </v-chip>
            <v-chip
              prepend-icon="mdi-account-circle-outline"
              variant="outlined"
              size="small"
              color="accent"
              @click="handleProfile"
              class="mr-2"
            >
              個人資料
            </v-chip>
            <v-chip
              prepend-icon="mdi-logout"
              variant="outlined"
              size="small"
              color="accent"
              @click="handleLogout"
            >
              登出
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.user-area {
  position: relative;
  padding-right: 1rem;

  @media screen and (min-width: 600px) {
    &:before {
      content: '';
      position: absolute;
      right: 0;
      display: block;
      width: 1px;
      height: 75%;
      top: 50%;
      transform: translateY(-50%);
      /* border-right: 1px dashed #7a80a1; */
      border-right: 1px dashed #ffffff97;
    }
  }
}

.is-not-login {
  flex-direction: column;
  @media screen and (min-width: 600px) {
    flex-direction: row;
  }
}

.nav-left,
.nav-right {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
}
</style>
