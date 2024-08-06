<script setup lang="ts">
import { watch } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { updatePlayerInfoAPI } from '@/api/player'
import { handleResponse } from '@/utils/axios/resUtils'

import type {
  UpdatePlayerInfoResponse,
  GetPlayerInfoResponse
} from '@/api/player'
// Form Validate
import { useField, useForm } from 'vee-validate'
import { ProfileSchema } from '@/utils/form/profileSchema'

// Store
const dialogStore = useDialogStore()
const userStore = useUserStore()

const { showProfileDialog } = storeToRefs(dialogStore)
const { password, account, balance_frozen, balance } =
  storeToRefs(userStore)

// 使用 vee-validate 管理表單
const { handleSubmit } = useForm({
  validationSchema: ProfileSchema
})

// 定義表單欄位
const {
  value: withdrawTonWalletFieldValue,
  errorMessage: withdrawTonWalletErrorMsg
} = useField<string>('withdraw_wallet')

// 表單欄位初始化
withdrawTonWalletFieldValue.value =
  userStore.withdraw_wallet ?? ''

// 提交表單
const submit = handleSubmit(async (values) => {
  const params = {
    m_code: import.meta.env.VITE_M_CODE,
    account: account.value,
    password: password.value,
    withdraw_wallet: values.withdraw_wallet
  }

  const res = (await updatePlayerInfoAPI(
    params
  )) as UpdatePlayerInfoResponse
  handleResponse(
    res,
    updatePlayerInfoSuccess,
    updatePlayerInfoFail
  )
})
const updatePlayerInfoSuccess = () => {
  dialogStore.showAlert({
    icon: 'done',
    text: '更新成功'
  })
  getPlayerInfo()
}

const updatePlayerInfoFail = (
  res: UpdatePlayerInfoResponse
) => {
  dialogStore.showAlert({
    icon: 'fail',
    text:
      res?.code && res?.message
        ? res.code + res?.message
        : '發生錯誤'
  })
  return
}

const getPlayerInfo = async () => {
  const res =
    (await userStore.getPlayerInfo()) as GetPlayerInfoResponse

  handleResponse(res)
}

watch(showProfileDialog, (newValue) => {
  if (newValue) {
    getPlayerInfo()
  }
})
</script>

<template>
  <v-dialog
    v-model="showProfileDialog"
    persistent
    max-width="600"
    @click:outside="dialogStore.switchProfileDialog"
  >
    <v-card>
      <v-card-title class="headline">個人資料</v-card-title>
      <v-card-text>
        <form @submit.prevent="submit">
          <v-text-field
            v-model="account"
            disabled
            label="帳號"
            required
          />

          <v-text-field
            v-model="withdrawTonWalletFieldValue"
            :counter="48"
            :error-messages="withdrawTonWalletErrorMsg"
            label="錢包地址"
            required
          />
          <v-text-field
            disabled
            v-model="balance"
            label="餘額"
          />
          <v-text-field
            disabled
            v-model="balance_frozen"
            label="凍結餘額"
          />

          <v-card-actions>
            <v-btn color="primary" type="submit">
              保存
            </v-btn>
            <v-btn @click="dialogStore.switchProfileDialog">
              關閉
            </v-btn>
          </v-card-actions>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
