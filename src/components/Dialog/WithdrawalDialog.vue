<script setup lang="ts">
import { watch, onMounted, ref, computed } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { handleResponse } from '@/utils/axios/resUtils'
import type {
  GetPlayerInfoResponse,
  CryptoWalletWithdrawResponse
} from '@/api/player'
// Form Validate
import { useField, useForm } from 'vee-validate'
import { WithdrawalSchema } from '@/utils/form/withdrawalSchema'
import message from '@/utils/message'
// API
import { updatePlayerInfoAPI } from '@/api/player'
// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()
const { balance, withdraw_wallet } = storeToRefs(userStore)
const { showWithdrawalDialog } = storeToRefs(dialogStore)

// 使用 vee-validate 管理表單
const { handleSubmit, handleReset } = useForm({
  validationSchema: WithdrawalSchema(balance.value)
})

// 定義表單欄位
const {
  value: transferAmountFieldValue,
  errorMessage: transferAmountErrorMsg
} = useField<string>('transfer_amount')
const {
  value: withdrawWalletFieldValue,
  errorMessage: withdrawErrorMsg
} = useField<string>('withdraw_wallet')

// Data
const tonToUsdRate = ref(0)
const isSubmitting = ref(false)

// const transferAmountValue = computed(
//   () => parseFloat(transferAmountFieldValue.value) || 0
// )
// const isTransferAmountValid = computed(
//   () => transferAmountValue.value !== 0
// )
// const usdValue = computed(
//   () => transferAmountValue.value * tonToUsdRate.value
// )

// Dummy API endpoint for demonstration
const fetchTonToUsdRate = async () => {
  try {
    const response = await fetch(
      'https://tonapi.io/v2/rates?tokens=ton&currencies=usd'
    )
    const data = await response.json()
    tonToUsdRate.value = data?.rates?.TON?.prices?.USD
  } catch (error) {
    console.error('Failed to fetch Ton to USD rate:', error)
  }
}

const withdrawalSuccess = async () => {
  dialogStore.showAlert({
    icon: 'done',
    text: message.withdrawal.success
  })

  // 更新用户余额
  await userStore.getPlayerInfo()

  // 重置表單
  handleReset()

  // 重新取得 User 資料
  await userStore.getPlayerInfo()

  // 關閉燈箱
  dialogStore.switchWithdrawalDialog()
}

const withdrawalFail = (
  res: CryptoWalletWithdrawResponse
) => {
  dialogStore.showAlert({
    icon: 'fail',
    text: message.common.fail(res)
  })
}

onMounted(() => {
  // fetchTonToUsdRate()
  getPlayerInfo()

  // 填寫 USER 個人的錢包地址預設值
  withdrawWalletFieldValue.value =
    userStore.withdraw_wallet || ''
})

// 提交表單
const submit = handleSubmit(async (values) => {
  // 检查 userStore 中的 withdraw_wallet 是否为空
  console.log(
    'userStore.withdraw_wallet',
    userStore.withdraw_wallet
  )
  console.log(
    'values.withdraw_wallet',
    values.withdraw_wallet
  )
  if (
    !userStore.withdraw_wallet ||
    userStore.withdraw_wallet !== values.withdraw_wallet
  ) {
    try {
      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        account: userStore.account,
        password: userStore.password,
        withdraw_wallet: values.withdraw_wallet
      }
      // 先更新用户的钱包地址
      const updateRes = await updatePlayerInfoAPI(params)
      if (updateRes.code !== '0') {
        // 更新失败,显示错误信息
        dialogStore.showAlert({
          icon: 'fail',
          text: updateRes.message || '更新钱包地址失败'
        })
        return
      }
      // 更新成功,更新 userStore 中的 withdraw_wallet
      userStore.withdraw_wallet = values.withdraw_wallet
    } catch (error) {
      console.error('更新钱包地址失败:', error)
      dialogStore.showAlert({
        icon: 'fail',
        text: '更新钱包地址时发生错误'
      })
      return
    }
  }

  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const res = await userStore.handleWithdraw(
      values.transfer_amount
    )

    handleResponse(
      res as CryptoWalletWithdrawResponse,
      withdrawalSuccess,
      withdrawalFail
    )
  } catch (error) {
    console.error('提款失敗:', error)
  } finally {
    isSubmitting.value = false
  }
})

const getPlayerInfo = async () => {
  const res =
    (await userStore.getPlayerInfo()) as GetPlayerInfoResponse

  handleResponse(res)
}

watch(showWithdrawalDialog, (newValue) => {
  console.log('newValue', newValue)
  if (newValue) {
    getPlayerInfo()
  }
})
</script>

<template>
  <v-dialog
    v-model="showWithdrawalDialog"
    persistent
    max-width="600"
    @click:outside="dialogStore.switchWithdrawalDialog"
  >
    <v-card>
      <v-card-title class="headline">取款</v-card-title>
      <v-card-text>
        <form @submit.prevent="submit">
          <!-- 錢包地址輸入 -->
          <v-text-field
            v-model="withdrawWalletFieldValue"
            :error-messages="withdrawErrorMsg"
            label="錢包地址"
            outlined
          />

          <!-- 轉帳金額輸入 -->
          <v-text-field
            v-model.number="transferAmountFieldValue"
            :error-messages="transferAmountErrorMsg"
            label="轉帳金額"
            outlined
            type="number"
          />

          <div class="ml-4 mt-1">
            <span style="color: red" class="caption">
              目前余额 USDT {{ balance.toFixed(2) }}
            </span>
            <br />
            <!-- 顯示 Ton 到 USD 匯率 -->
            <!-- <span class="caption"
              >1 TON ≈
              {{ tonToUsdRate.toFixed(4) }} USD</span
            > -->
            <!-- <br />
            <span
              class="caption"
              v-show="isTransferAmountValid"
            >
              {{ transferAmountValue }} TON ≈
              {{ usdValue }} USD
            </span> -->
          </div>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit"
              >送出
            </v-btn>
            <v-btn
              color="primary"
              @click="dialogStore.switchWithdrawalDialog"
              >取消
            </v-btn>
          </v-card-actions>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss">
.caption {
  font-size: 12px;
}
</style>
