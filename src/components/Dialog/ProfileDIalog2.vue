<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { UpdatePlayerInfoParams } from '@/api/player'
import { handleResponse } from '@/utils/axios/resUtils'
// Form Validate
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'

// Store
const dialogStore = useDialogStore()
const userStore = useUserStore()

const { showProfileDialog } = storeToRefs(dialogStore)
const { account, nickname, ton_wallet, balance } =
  storeToRefs(userStore)

// 定義驗證
const schema = yup.object({
  nickname: yup
    .string()
    .required('名稱是必須的')
    .max(10, '不能超過10字'),
  ton_wallet: yup
    .string()
    .required('錢包地址是必須的')
    .max(42, '錢包地址不能超過42個字')
})

// 使用 vee-validate 管理表單
const { handleSubmit, handleReset } = useForm({
  validationSchema: schema
  // defaultValues: {
  //   nickname: '',
  // }
})

const nickname = useField('nickname')
const ton_wallet = useField('ton_wallet')

// 提交表單
const submit = handleSubmit(async (values) => {
  const params = {
    m_code: userStore.m_code,
    account: userStore.account,
    password: userStore.password,
    nickname: values.nickname,
    ton_wallet: values.ton_wallet
  }
  const res = await userStore.updatePlayerInfo(params)
  handleResponse(res)
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
            v-model="nickname.value"
            :counter="20"
            :error-messages="nickname.errorMessage"
            label="名稱"
            required
          ></v-text-field>
          <v-text-field
            v-model="ton_wallet.value"
            :counter="42"
            :error-messages="ton_wallet.errorMessage"
            label="錢包地址"
            required
          ></v-text-field>
          <v-text-field
            :value="balance.value"
            :error-messages="balance.errorMessage"
            label="餘額"
            readonly
          ></v-text-field>
          <v-card-actions>
            <v-btn color="primary" type="submit"
              >保存</v-btn
            >
            <v-btn @click="handleReset">取消</v-btn>
          </v-card-actions>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
