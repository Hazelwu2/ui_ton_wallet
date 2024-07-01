import { defineStore } from 'pinia'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'
import { playerRegisterAPI, playerLoginAPI } from '@/api/player'
import type { PlayerRegisterResponse, PlayerLoginResponse } from '@/api/player'

interface UserState {
  isLogin: boolean
  account?: string
  balance?: number
  ton_wallet?: string
  balance_frozen?: number
  vip_id?: number
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    isLogin: false,
    account: '',
    balance: 0,
    ton_wallet: '',
    balance_frozen: 0,
    vip_id: 0
  }),

  actions: {
    handleDeposit() {
      console.log('Deposit clicked')
      // 可以在这里编写存款逻辑
    },
    handleWithdraw() {
      console.log('Withdraw clicked')
      // 可以在这里编写取款逻辑
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
      this.ton_wallet = ''
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
        this.account = res.result.account
        this.balance = res.result.balance
        this.ton_wallet = res.result.ton_wallet
        this.balance_frozen = res.result.balance_frozen
        this.vip_id = res.result.vip_id
      }

      return res
    }
  }
  // as UserActions // 强制指定 actions 的类型为 UserActions
})
