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
const { photo_url, isLogin, account, balance } =
  storeToRefs(userStore)
// Action
const { handleRegister, ifUserIsLogin } = userStore
const { showAlert } = dialogStore
const menu = ref(false)

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

const copyAccount = () => {
  if (!account.value)
    throw new Error(
      'copyAccount account.value is undeinfed'
    )

  navigator.clipboard.writeText(account.value).then(() => {
    dialogStore.showAlert({
      icon: 'done',
      text: message.copy.success
    })
  })
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

const menuItems = ref([
  {
    title: '個人資料',
    icon: 'mdi-account-circle-outline',
    handler: handleProfile
  },
  {
    title: '存款',
    icon: 'mdi-currency-usd',
    handler: handleDeposit
  },
  {
    title: '取款',
    icon: 'mdi-bank-transfer',
    handler: handleWithdrawal
  },
  {
    title: '登出',
    icon: 'mdi-logout',
    handler: handleLogout
  }
])

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
    <nav>
      <!-- Telegram 按鈕會被動態載入並插入在這 -->
      <div
        v-if="!isLogin"
        id="telegram-login-container"
        class="align-center d-none"
      />
      <!-- Telegram 按鈕 End -->

      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        location="end"
      >
        <template v-slot:activator="{ props }">
          <!-- <v-avatar color="brown" size="large">
          
        </v-avatar> -->
          <v-avatar v-bind="props">
            <v-img
              size="large"
              alt="John"
              src="https://cdn.vuetifyjs.com/images/john.jpg"
            />
            <!-- <span class="text-h5">Hazel</span> -->
          </v-avatar>
        </template>

        <v-card min-width="500">
          <v-list>
            <v-list-item v-if="!isLogin">
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
            </v-list-item>
          </v-list>
          <v-list v-if="isLogin">
            <v-list-item
              prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
            >
              <template v-slot:title>
                <div
                  class="cursor-pointer d-flex align-center"
                >
                  {{ account }}
                  <v-icon
                    size="x-small"
                    @click="copyAccount"
                    color="info"
                    class="ml-2"
                    >mdi-content-copy</v-icon
                  >
                </div>
              </template>
              <template v-slot:subtitle>
                <div class="d-flex align-center">
                  <v-icon
                    class="mr-2"
                    icon="mdi-wallet-outline"
                  />
                  TON 钱包余额 $ {{ balance }}
                </div>
              </template>
              <template v-slot:append>
                <v-btn
                  icon="mdi-refresh"
                  variant="text"
                  @click="getPlayerInfo"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <v-list v-if="isLogin">
            <v-list-item
              v-for="(item, index) in menuItems"
              :key="index"
              @click="item.handler"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </nav>
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

nav {
  width: 100%;
  font-size: 12px;
  margin-top: 0.5rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  text-align: right;
}
</style>
