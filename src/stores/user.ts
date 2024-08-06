import { defineStore } from 'pinia'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'
import {
  playerRegisterAPI, playerLoginAPI,
  cryptoWalletWithdrawAPI,
  updatePlayerInfoAPI,
  getPlayerInfoAPI
} from '@/api/player'

import type {
  CryptoWalletWithdrawResponse,
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
  withdraw_wallet: string
  deposit_wallet: string
  balance_frozen?: number
  vip_id?: number
  first_name?: string
  username?: string
  photo_url?: string
  auth_date?: number
  stockToken?: string
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    isLogin: false,
    m_code: import.meta.env.m_code,
    password: import.meta.env.VITE_PLAYER_PASSWORD,
    account: '',
    balance: 0,
    withdraw_wallet: '',
    deposit_wallet: '',
    nickname: '',
    balance_frozen: 0,
    vip_id: 0,
    // Telegram
    first_name: '',
    username: '',
    photo_url: '',
    auth_date: 0,

    stockToken: ''
  }),

  actions: {
    ifUserIsLogin() {
      if (this.isLogin) return true

      return false
    },

    handleDeposit() {
      console.log('Deposit clicked')
    },

    async handleWithdraw(transfer_amount: number): Promise<CryptoWalletWithdrawResponse | undefined> {
      if (!this.account) throw new Error('handleWithdraw 發生錯誤：缺少參數 account')

      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        account: this.account,
        password: import.meta.env.VITE_PLAYER_PASSWORD,
        transfer_amount
      }

      // 請求 API
      const res = await cryptoWalletWithdrawAPI(params) as CryptoWalletWithdrawResponse
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
        if (res?.result && res?.result?.withdraw_wallet) {
          // 更新提款帳號、餘額、凍結餘額
          this.withdraw_wallet = res?.result?.withdraw_wallet
          this.balance = res?.result?.balance
          this.balance_frozen = res?.result?.balance_frozen
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
      this.withdraw_wallet = ''
      this.deposit_wallet = ''
      this.vip_id = 0
    },

    handleToken(token: string) {
      this.stockToken = token
    },

    // 處理註冊邏輯
    async handleRegister(
      user: TelegramUserData
    ): Promise<PlayerRegisterResponse | undefined> {
      // Telegram 回傳資料
      console.log('user', user)
      this.first_name = user.first_name
      this.username = user.username
      this.photo_url = user.photo_url
      this.auth_date = user.auth_date

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
        this.deposit_wallet = res.result.deposit_wallet ?? ''
        this.withdraw_wallet = res.result.withdraw_wallet ?? ''
        this.balance_frozen = res.result.balance_frozen ?? 0
        this.vip_id = res.result.vip_id
      }

      return res
    }
  },

  persist: true,
})
