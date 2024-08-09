<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import message from '@/utils/message'

// Pinia Vuex
const dialogStore = useDialogStore()
const userStore = useUserStore()
const { deposit_wallet } = userStore

const { showDepositDialog } = storeToRefs(dialogStore)

const TON_PRE_FIX = 'ton://transfer/'
const TRC20_PRE_FIX = 'tron://transfer/'
const qrCodeValue = `${TON_PRE_FIX}${deposit_wallet}`
// 生成 Ton Wallet 的 URI 链接
// const tonWalletUri = `${TON_PRE_FIX}${deposit_wallet}`
// 生成 TRC20
const trcWalletUri = `${TRC20_PRE_FIX}${deposit_wallet}`

// 打开 Ton Wallet 或 Ton Keeper
const openTonWallet = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    navigator.userAgent
  )

  if (isMobile) {
    let windowObj = window.open('', '_blank')
    if (!windowObj) throw new Error('windowObj 是 null')
    // 手机端
    windowObj.location.href = trcWalletUri
  } else {
    // windowObj.location.href = tonWalletUri
    // 电脑端，提示用户手动打开
    dialogStore.showAlert({
      icon: 'done',
      text: '请手动打开 Ton Wallet 或 Ton Keeper 并粘贴帐号地址'
    })
  }
}

// 复制钱包地址到剪贴板
const copyWalletAddress = () => {
  navigator.clipboard.writeText(deposit_wallet).then(() => {
    dialogStore.showAlert({
      icon: 'done',
      text: message.copy.success
    })
  })
}

const warningTextList = [
  '温馨提醒：请不要混淆 ERC20 和 TRC20 的地址，否则您可能会损失全部金额。',
  'ERC20 的地址通常都是以 0 和 x 开头，TRC20 的地址则是以大写 T 开头',
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

        <div>
          <a
            @click="copyWalletAddress"
            target="_blank"
            style="cursor: pointer"
          >
            {{ deposit_wallet }}
          </a>
          <span
            @click="copyWalletAddress"
            class="cursor-pointer"
          >
            <v-icon size="x-small" class="ml-2"
              >mdi-content-copy
            </v-icon>
          </span>
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
