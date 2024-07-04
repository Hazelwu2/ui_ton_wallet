<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import message from '@/utils/message'

// Pinia Vuex
const dialogStore = useDialogStore()
const userStore = useUserStore()
const { deposit_ton_wallet } = userStore

const { showDepositDialog } = storeToRefs(dialogStore)

const PRE_FIX = 'ton://transfer/'
const qrCodeValue = `${PRE_FIX}${deposit_ton_wallet}`
// 生成 Ton Wallet 的 URI 链接
// const tonWalletUri = `ton://transfer?address=${deposit_ton_wallet}`
const tonWalletUri = `ton://${deposit_ton_wallet}`

// 打开 Ton Wallet 或 Ton Keeper
const openTonWallet = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    navigator.userAgent
  )
  let windowObj = window.open('', '_blank')
  if (!windowObj) throw new Error('windowObj 是 null')

  if (isMobile) {
    // 手机端
    windowObj.location.href = tonWalletUri
  } else {
    windowObj.location.href = tonWalletUri
    // 电脑端，提示用户手动打开
    dialogStore.showAlert({
      icon: 'fail',
      text: '请手动打开 Ton Wallet 或 Ton Keeper 并粘贴帐号地址'
    })
  }
}

// 复制钱包地址到剪贴板
const copyWalletAddress = () => {
  navigator.clipboard
    .writeText(deposit_ton_wallet)
    .then(() => {
      dialogStore.showAlert({
        icon: 'done',
        text: message.copy.success
      })
    })
}

const warningTextList = [
  '请确认钱包地址是否正确。',
  '错误的钱包地址可能导致资金无法找回。',
  '区块链转帐是不可撤回的，请确保所有信息正确无误。',
  '请勿向不明来源的钱包地址转帐，避免遭受诈骗或资金损失。',
  '确认您要转帐的金额是否在允许的范围内。',
  '转帐过程中可能会产生网络费用，请确保余额充足以支付这些费用。'
]
</script>

<template>
  <v-dialog
    v-model="showDepositDialog"
    persistent
    max-width="600"
    @click:outside="dialogStore.switchDepositDialog"
  >
    <v-card>
      <v-card-title class="headline">存款</v-card-title>
      <v-card-text class="text-center">
        <qrcode-vue :value="qrCodeValue" :size="200" />

        <a
          @click="openTonWallet"
          target="_blank"
          style="cursor: pointer"
        >
          {{ deposit_ton_wallet }}
        </a>
        <div
          @click="copyWalletAddress"
          class="cursor-pointer"
        >
          <v-icon class="ml-2">mdi-content-copy</v-icon>
        </div>

        <v-alert type="warning" class="mt-4">
          <ul class="text-left">
            <li
              v-for="(item, i) in warningTextList"
              :key="i"
            >
              {{ item }}
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
