<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { handleResponse } from '@/utils/axios/resUtils'
import type { TonWalletWithdrawResponse } from '@/api/player'

// Pinia Vuex
const userStore = useUserStore()
const dialogStore = useDialogStore()
const { showWithdrawalDialog } = storeToRefs(dialogStore)

// Data
const transferAmount = ref(0)
const tonToUsdRate = ref(0)

// Dummy API endpoint for demonstration
const fetchTonToUsdRate = async () => {
  try {
    // Replace with actual API endpoint for Ton to USD exchange rate
    const response = await fetch(
      'https://tonapi.io/v2/rates?tokens=ton&currencies=usd'
    )
    const data = await response.json()
    tonToUsdRate.value = data?.rates?.TON?.prices?.USD
  } catch (error) {
    console.error('Failed to fetch Ton to USD rate:', error)
  }
}

// 取款請求
const submitWithdrawal = async () => {
  const res = await userStore.handleWithdraw(
    transferAmount.value
  )
  handleResponse(
    res as TonWalletWithdrawResponse,
    withdrawalSuccess,
    withdrawalFail
  )
}
const withdrawalSuccess = () => {
  dialogStore.showAlert({ icon: 'done', text: '成功' })
}
const withdrawalFail = (res: TonWalletWithdrawResponse) => {
  dialogStore.showAlert({
    icon: 'fail',
    text:
      res.code && res.message ? res.code + res.message : ''
  })
}

onMounted(() => {
  fetchTonToUsdRate()
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
        <!-- 錢包地址輸入 -->
        <v-text-field
          v-model="userStore.ton_wallet"
          label="錢包地址"
          outlined
          disabled
        ></v-text-field>

        <!-- 轉帳金額輸入 -->
        <v-text-field
          v-model.number="transferAmount"
          label="轉帳金額"
          outlined
          type="number"
        ></v-text-field>

        <!-- 顯示 Ton 到 USD 匯率 -->
        <span class="caption"
          >1 TON ≈ {{ tonToUsdRate.toFixed(2) }}</span
        >
        <br />
        <span class="caption"
          >{{ transferAmount }} Ton ≈
          {{ (transferAmount * tonToUsdRate).toFixed(2) }}
          USD</span
        >
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="submitWithdrawal"
          >送出
        </v-btn>
        <v-btn
          color="primary"
          @click="dialogStore.switchWithdrawalDialog"
          >取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
