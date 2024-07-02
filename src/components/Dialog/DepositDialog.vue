<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { useDialogStore } from '@/stores/dialog'
import { storeToRefs } from 'pinia'

// Pinia Vuex
const dialogStore = useDialogStore()
const { showDepositDialog } = storeToRefs(dialogStore)

const PRE_FIX = 'ton://transfer/'
const walletAddress = import.meta.env
  .VITE_DEPOSIT_WALLET_ADDRESS
const qrCodeValue = `${PRE_FIX}${walletAddress}`

const openWallet = () => {
  try {
    window.open(qrCodeValue, '_blank')
  } catch (e) {
    dialogStore.showAlert({
      icon: 'fail',
      text: '無法自動打開錢包，請改用 QR Code 掃描方式儲值'
    })
    alert(
      '無法自動打開錢包，請手動打開以下地址: ' +
        walletAddress
    )
  }
}
</script>

<template>
  <v-dialog
    v-model="showDepositDialog"
    persistent
    max-width="300"
    @click:outside="dialogStore.switchDepositDialog"
  >
    <v-card>
      <v-card-title class="headline">存款燈箱</v-card-title>
      <v-card-text class="text-center">
        <qrcode-vue :value="qrCodeValue" :size="200" />

        <a
          @click="openWallet"
          target="_blank"
          style="cursor: pointer"
        >
          {{ walletAddress }}
        </a>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="dialogStore.switchDepositDialog"
          >關閉</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
