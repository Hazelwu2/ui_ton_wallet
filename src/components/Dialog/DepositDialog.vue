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
// 生成 Ton Wallet 的 URI 链接
const tonWalletUri = `ton://transfer?address=${walletAddress}`

// 打开 Ton Wallet 或 Ton Keeper
const openTonWallet = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    navigator.userAgent
  )

  if (isMobile) {
    // 手机端
    window.location.href = tonWalletUri
  } else {
    window.location.href = tonWalletUri
    // 电脑端，提示用户手动打开
    dialogStore.showAlert({
      icon: 'fail',
      text: '请手动打开 Ton Wallet 或 Ton Keeper 并粘贴帐号地址'
    })
  }
}

// 复制钱包地址到剪贴板
const copyWalletAddress = () => {
  const textarea = document.createElement('textarea')
  textarea.value = walletAddress
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  dialogStore.showAlert({
    icon: 'done',
    text: '钱包地址已复制到剪贴板'
  })
}
</script>

<template>
  <v-dialog
    v-model="showDepositDialog"
    persistent
    max-width="600"
    @click:outside="dialogStore.switchDepositDialog"
  >
    <v-card>
      <v-card-title class="headline">存款燈箱</v-card-title>
      <v-card-text class="text-center">
        <qrcode-vue :value="qrCodeValue" :size="200" />

        <a
          @click="openTonWallet"
          target="_blank"
          style="cursor: pointer"
        >
          {{ walletAddress }}
        </a>
        <v-icon @click="copyWalletAddress" class="ml-2"
          >mdi-content-copy</v-icon
        >

        <v-alert type="warning" class="mt-4">
          <ul class="text-left">
            <li>
              請確認錢包地址是否正確。錯誤的錢包地址可能導致資金無法找回。
            </li>
            <li>
              區塊鏈轉帳是不可撤回的，請確保所有信息正確無誤。
            </li>
            <li>
              請勿向不明來源的錢包地址轉帳，避免遭受詐騙或資金損失。
            </li>
            <li>確認您要轉帳的金額是否在允許的範圍內。</li>
            <li>
              轉帳過程中可能會產生網絡費用，請確保餘額充足以支付這些費用。
            </li>
          </ul>
        </v-alert>
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
