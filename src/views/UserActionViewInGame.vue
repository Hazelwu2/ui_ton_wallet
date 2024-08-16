<script setup lang="ts">
// Dialog
import Alert from '@/components/Dialog/ShowAlert.vue'
import DepositDialog from '@/components/Dialog/DepositDialog.vue'
import WithdrawalDialog from '@/components/Dialog/WithdrawalDialog.vue'
import ProfileDialog from '@/components/Dialog/ProfileDialog.vue'
// Utils
import {
  loadTelegramWidget,
  getTelegramAuthUrl,
  usingCodeToGetAccessToken
} from '@/utils/telegram/telegramLogin'
// import QrcodeVue from 'qrcode.vue'
import { ref, onMounted } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useField, useForm } from 'vee-validate'
import { WithdrawalSchema } from '@/utils/form/withdrawalSchema'
import { ProfileSchema } from '@/utils/form/profileSchema'
import message from '@/utils/message'

// Pinia Vuex
const dialogStore = useDialogStore()
const userStore = useUserStore()
const {
  deposit_wallet,
  withdraw_wallet,
  balance,
  account,
  lobby_url,
  balance_frozen,
  isLogin
} = storeToRefs(userStore)

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

// 复制钱包地址到剪贴板
const copyWalletAddress = () => {
  navigator.clipboard.writeText(deposit_wallet).then(() => {
    dialogStore.showAlert({
      icon: 'done',
      text: message.copy.success
    })
  })
}

const submitWithdrawal = handleWithdrawalSubmit(
  async (values) => {
    const res = await userStore.handleWithdraw(
      values.transfer_amount
    )
    // 處理回應
  }
)

const submitProfile = handleProfileSubmit(
  async (values) => {
    const params = {
      m_code: import.meta.env.VITE_M_CODE,
      account: account.value,
      password: '', // 假設你要在這裡更新密碼，需替換為實際的值
      withdraw_wallet: values.withdraw_wallet
    }
    const res = await userStore.updatePlayerInfo(params)
    // 處理回應
  }
)

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

onMounted(() => {
  // 載入 Telegram 第三方登入
  loadTelegramWidget()

  if (isLogin.value && !userStore.lobby_url) {
    userStore.getXgdLobby()
  }

  usingCodeToGetAccessToken()
})
</script>

<template>
  <v-container>
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
    </v-row>

    <!-- Display Balance -->
    <v-row class="mt-6">
      <v-col col="12" align="center">
        <h2 class="text-caption">余额 Balance</h2>
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
          $ {{ balance }}
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
  </v-container>
</template>

<style scoped>
.caption {
  font-size: 12px;
}
</style>
