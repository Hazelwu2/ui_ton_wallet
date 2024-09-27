<script setup lang="ts">
import { getCurrentInstance } from 'vue'
// Dialog
import Alert from '@/components/Dialog/ShowAlert.vue'
import DepositDialog from '@/components/Dialog/DepositDialog.vue'
import WithdrawalDialog from '@/components/Dialog/WithdrawalDialog.vue'
// import ProfileDialog from '@/components/Dialog/ProfileDialog.vue'
// Type
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'
import type {
  GetPlayerInfoResponse,
  PlayerRegisterResponse
} from '@/api/player'
// Utils
import { handleResponse } from '@/utils/axios/resUtils'
import {
  // loadTelegramWidget,
  usingCodeToGetAccessToken
} from '@/utils/telegram/telegramLogin'
import { ref, onMounted } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useField, useForm } from 'vee-validate'
import { WithdrawalSchema } from '@/utils/form/withdrawalSchema'
import { ProfileSchema } from '@/utils/form/profileSchema'
import message from '@/utils/message'

const { proxy } = getCurrentInstance()!
const $isTelegramMiniApp = proxy!.$isTelegramMiniApp
// Pinia Vuex
const dialogStore = useDialogStore()
const { showAlert } = dialogStore
const userStore = useUserStore()
const {
  // deposit_wallet,
  // withdraw_wallet,
  balance,
  account,
  lobby_url,
  balance_frozen,
  isLogin
} = storeToRefs(userStore)

const isRefreshing = ref(false)

// 使用 vee-validate 管理表單
const { handleSubmit: handleWithdrawalSubmit } = useForm({
  validationSchema: WithdrawalSchema(balance.value)
})
const { handleSubmit: handleProfileSubmit } = useForm({
  validationSchema: ProfileSchema
})

// 定義提款表單欄位
const {
  value: transferAmountFieldValue,
  errorMessage: transferAmountErrorMsg
} = useField<string>('transfer_amount')

// 定義個人資料表單欄位
const {
  value: withdrawWalletFieldValue,
  errorMessage: withdrawWalletErrorMsg
} = useField<string>('withdraw_wallet')

withdrawWalletFieldValue.value =
  userStore.withdraw_wallet ?? ''

// // 复制钱包地址到剪贴板
// const copyWalletAddress = () => {
//   navigator.clipboard
//     .writeText(deposit_wallet.value)
//     .then(() => {
//       dialogStore.showAlert({
//         icon: 'done',
//         text: message.copy.success
//       })
//     })
// }

const submitWithdrawal = handleWithdrawalSubmit(
  async (values) => {
    const res = await userStore.handleWithdraw(
      values.transfer_amount
    )
    // 處理回應
  }
)

// const submitProfile = handleProfileSubmit(
//   async (values) => {
//     const params = {
//       m_code: import.meta.env.VITE_M_CODE,
//       account: account.value,
//       password: '', // 假設你要在這裡更新密碼，需替換為實際的值
//       withdraw_wallet: values.withdraw_wallet
//     }
//     const res = await userStore.updatePlayerInfo(params)
//     // 處理回應
//   }
// )

const handleDeposit = () => {
  if (!userStore.ifUserIsLogin()) {
    dialogStore.showAlert({
      icon: 'fail',
      text: message.auth
    })
    return
  }

  dialogStore.switchDepositDialog()
}

const handleWithdrawal = () => {
  if (!userStore.ifUserIsLogin()) {
    dialogStore.showAlert({
      icon: 'fail',
      text: message.auth
    })
    return
  }

  dialogStore.switchWithdrawalDialog()
}

const getPlayerInfo = async () => {
  isRefreshing.value = true
  try {
    const res =
      (await userStore.getPlayerInfo()) as GetPlayerInfoResponse
    handleResponse(
      res,
      getPlayerInfoSuccess,
      getPlayerInfoFail
    )
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

const getPlayerInfoSuccess = () => {
  // showAlert({
  //   icon: 'done',
  //   text: '更新余额成功'
  // })
}
const getPlayerInfoFail = (res: GetPlayerInfoResponse) => {
  showAlert({
    icon: 'fail',
    text: message.common.fail(res)
  })
}

// 在遊戲畫面內呼叫 Post Message 呼叫遊戲前端
const handleClose = () => {
  console.error('click post message update')

  // window.parent.postMessage('cs_cashier_close', {})
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

onMounted(() => {
  if (isLogin.value) {
    getPlayerInfo()

    if (lobby_url) {
      userStore.getXgdLobby()
    }
  }

  usingCodeToGetAccessToken()

  ;(window as any).CsCashierClose = () => {
    console.log('start to call postMessage')
    window.parent.postMessage('cs_cashier_close', '')
    console.log('call postMessage already!, latest version')
  }
})

onMounted(async () => {
  const urlParams = new URLSearchParams(
    window.location.search
  )

  // 擷取 query 參數
  const queryKeys = ['account']
  const userData = queryKeys.reduce(
    (acc, key) => {
      acc[key] = urlParams.get(key) || ''
      return acc
    },
    {} as Record<string, string>
  )

  console.error('userData')
  console.log(userData)

  const params = {
    m_code: import.meta.env.VITE_M_CODE,
    account: userData.account,
    // 預設密碼寫死
    password: import.meta.env.VITE_PLAYER_PASSWORD
  }
  const res = await userStore.handleLogin(params)
  console.log('res')
  console.log(res)
})
</script>

<template>
  <v-container>
    <!-- Alert -->
    <Alert
      class="alert"
      :dialog="dialogStore.alertStatus"
      :icon="dialogStore.icon"
      :text="dialogStore.text"
    />

    <!-- 存款、取款、個人資料燈箱 Start -->
    <v-dialog
      v-model="dialogStore.showDepositDialog"
      max-width="600"
    >
      <DepositDialog />
    </v-dialog>

    <v-dialog
      v-model="dialogStore.showWithdrawalDialog"
      max-width="600"
    >
      <WithdrawalDialog />
    </v-dialog>

    <div v-if="!isLogin">
      <div class="please-login">驗證登入中...</div>
    </div>

    <div v-else>
      <v-row align="center">
        <v-avatar size="48" class="cursor-pointer">
          <img
            src="https://i.pravatar.cc/48"
            alt="Profile Picture"
          />
        </v-avatar>
        <v-col>
          <div class="cursor-pointer">{{ account }}</div>
        </v-col>
        <v-col align="end">
          <v-btn variant="text" @click="CsCashierClose()">
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Display Balance -->
      <v-row class="mt-6">
        <v-col col="12" align="center">
          <h2 class="text-caption">
            余额 Balance
            <v-btn
              icon="mdi-refresh"
              variant="text"
              size="xs"
              @click="getPlayerInfo"
            />
          </h2>
          <h1 class="text-white text-h4 font-weight-bold">
            $ {{ balance }}
          </h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col col="12" align="center">
          <h2 class="text-caption">
            冻结余额 Freeze Balance
          </h2>
          <h1 class="text-white text-h4 font-weight-bold">
            $ {{ balance_frozen }}
          </h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col align="center">
          <div>
            <v-btn
              rounded="xl"
              class="mr-4"
              @click="handleDeposit"
            >
              <v-icon>mdi-arrow-up-thin</v-icon>
              存款
            </v-btn>
            <v-btn rounded="xl" @click="handleWithdrawal">
              <v-icon>mdi-wallet-outline</v-icon>
              取款
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.caption {
  font-size: 12px;
}
.please-login {
  margin-top: 2rem;
  padding: 20px;
  text-align: center;
  border: 1px solid;
}
</style>
