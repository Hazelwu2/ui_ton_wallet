import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { getGameListAPI, launchGameAPI } from '@/api/game'
import type { LaunchGameResponse, GameListResponse } from '@/api/game'


export const useGameStore = defineStore({
  id: 'game',
  state: () => ({
    gameList: [],
    page_size: 8,
    page_num: 1,
    vendor_code: 'xgd'
  }),

  actions: {
    // 取得遊戲清單
    async getGameList(): Promise<GameListResponse | undefined> {
      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        lang: 'zh',
        page_size: this.page_size,
        page_num: this.page_num,
        vendor_code: this.vendor_code
      }

      // 請求 API
      const res = await getGameListAPI(params)

      return res
    },

    // 啟動遊戲
    async launchGame(game_code: string): Promise<LaunchGameResponse | undefined> {
      const userStore = useUserStore()

      if (!userStore.account) {
        throw new Error('查無參數 Account is undefined，請先登入！');
      }

      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        account: userStore.account,
        launch_game: game_code,
        lang: "zh"
      }

      const res = await launchGameAPI(params)
      return res
    }
  }

})
