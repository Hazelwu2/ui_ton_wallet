import { defineStore } from 'pinia'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'
import {
  playerRegisterAPI, playerLoginAPI,
  tonWalletWithdrawAPI,
  updatePlayerInfoAPI,
  getPlayerInfoAPI
} from '@/api/player'

import type {
  TonWalletWithdrawResponse,
  PlayerRegisterResponse,
  PlayerLoginResponse,
  UpdatePlayerInfoParams,
  UpdatePlayerInfoResponse,
  GetPlayerInfoParams,
  GetPlayerInfoResponse,
} from '@/api/player'


interface UserState {
  isLogin: boolean
  account: string
  m_code: string
  password: string,
  nickname?: string
  balance: number
  withdraw_ton_wallet: string
  deposit_ton_wallet: string
  balance_frozen?: number
  vip_id?: number
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    isLogin: false,
    m_code: import.meta.env.m_code,
    password: import.meta.env.VITE_PLAYER_PASSWORD,
    account: '',
    balance: 0,
    withdraw_ton_wallet: '',
    deposit_ton_wallet: '',
    nickname: '',
    balance_frozen: 0,
    vip_id: 0
  }),

  actions: {
    ifUserIsLogin() {
      if (this.isLogin) return true

      return false
    },

    handleDeposit() {
      console.log('Deposit clicked')
    },

    async handleWithdraw(transfer_amount: number): Promise<TonWalletWithdrawResponse | undefined> {
      if (!this.account) throw new Error('handleWithdraw 發生錯誤：缺少參數 account')

      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        account: this.account,
        password: import.meta.env.VITE_PLAYER_PASSWORD,
        transfer_amount
      }

      // 請求 API
      const res = await tonWalletWithdrawAPI(params) as TonWalletWithdrawResponse
      return res
    },

    async updatePlayerInfo(params: UpdatePlayerInfoParams): Promise<UpdatePlayerInfoResponse | undefined> {
      // 調用 API 更新個人資料
      try {
        // API 更新玩家資料
        const res = await updatePlayerInfoAPI(params)

        return res
      } catch (error) {
        console.error('更新失敗', error)
      }
    },

    // 調用 API 取得個人資料  
    async getPlayerInfo(): Promise<GetPlayerInfoResponse | undefined> {
      try {
        const params: GetPlayerInfoParams = {
          m_code: import.meta.env.VITE_M_CODE,
          account: this.account,
          password: this.password
        }

        // API 取得玩家資料
        const res = await getPlayerInfoAPI(params)

        // 更新 state 中的資料
        if (res?.result && res?.result?.withdraw_ton_wallet) {
          this.withdraw_ton_wallet = res?.result?.withdraw_ton_wallet
        }

        return res
      } catch (error) {
        console.error('更新失敗', error)
      }
    },

    handleProfile() {
      console.log('Profile clicked')
      // 可以在这里编写个人资料跳转逻辑
    },

    handleLogout() {
      this.isLogin = false
      this.account = ''
      this.balance = 0
      this.balance_frozen = 0
      this.withdraw_ton_wallet = ''
      this.deposit_ton_wallet = ''
      this.vip_id = 0
    },

    // 處理註冊邏輯
    async handleRegister(
      user: TelegramUserData
    ): Promise<PlayerRegisterResponse | undefined> {
      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        account: user?.id?.toString(),
        // 預設密碼寫死
        password: import.meta.env.VITE_PLAYER_PASSWORD
      }

      // 請求 API
      const res = await playerRegisterAPI(params)

      const accounIsExist =
        res?.code === 'E1111' && res?.message === '帳號已存在'
      const registerSuccess = res?.code === '0'
      /*
       */

      // 若已註冊過帳號已存在、註冊成功，請求登入
      if (accounIsExist || registerSuccess) {
        const res = await this.handleLogin(params)
        return res
      }

      return res
    },

    // 處理登入邏輯
    async handleLogin(params: any): Promise<PlayerLoginResponse | undefined> {
      const res = await playerLoginAPI(params)

      if (res?.code === '0') {
        this.isLogin = true
        this.account = res.result.account ?? ''
        this.balance = res.result.balance ?? 0
        this.deposit_ton_wallet = res.result.deposit_ton_wallet ?? ''
        this.withdraw_ton_wallet = res.result.withdraw_ton_wallet ?? ''
        this.balance_frozen = res.result.balance_frozen ?? 0
        this.vip_id = res.result.vip_id
      }

      return res
    }
  },

  persist: true,
})
