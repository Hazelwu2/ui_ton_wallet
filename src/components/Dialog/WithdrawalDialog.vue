<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { handleResponse } from '@/utils/axios/resUtils'
import type { TonWalletWithdrawResponse } from '@/api/player'
// Form Validate
import { useField, useForm } from 'vee-validate'
import { WithdrawalSchema } from '@/utils/form/withdrawalSchema'
import message from '@/utils/message'

// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()
const { balance, withdraw_ton_wallet } =
  storeToRefs(userStore)
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

// Data
const tonToUsdRate = ref(0)

const transferAmountValue = computed(
  () => parseFloat(transferAmountFieldValue.value) || 0
)
const isTransferAmountValid = computed(
  () => transferAmountValue.value !== 0
)
const usdValue = computed(
  () => transferAmountValue.value * tonToUsdRate.value
)

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

  // 重置表單
  handleReset()
  // 重新取得 User 資料
  await userStore.getPlayerInfo()
  // 關閉燈箱
  dialogStore.switchWithdrawalDialog()
}

const withdrawalFail = (res: TonWalletWithdrawResponse) => {
  dialogStore.showAlert({
    icon: 'fail',
    text: message.common.fail(res)
  })
}

onMounted(() => {
  fetchTonToUsdRate()
})

// 提交表單
const submit = handleSubmit(async (values) => {
  const res = await userStore.handleWithdraw(
    values.transfer_amount
  )

  handleResponse(
    res as TonWalletWithdrawResponse,
    withdrawalSuccess,
    withdrawalFail
  )
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
            v-model="withdraw_ton_wallet"
            label="錢包地址"
            outlined
            disabled
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
              目前餘額 TON {{ balance }}
            </span>
            <br />
            <!-- 顯示 Ton 到 USD 匯率 -->
            <span class="caption"
              >1 TON ≈
              {{ tonToUsdRate.toFixed(4) }} USD</span
            >
            <br />
            <span
              class="caption"
              v-show="isTransferAmountValid"
            >
              {{ transferAmountValue }} TON ≈
              {{ usdValue }} USD
            </span>
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
