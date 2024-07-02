import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { getGameListAPI, launchGameAPI } from '@/api/game'
import type {
  LaunchGameResponse,
  GameListResponse,
  GameList,
  GameListResult
} from '@/api/game'
import type { CustomAxiosResponse } from '@/utils/axios/resUtils'


export const useGameStore = defineStore({
  id: 'game',
  state: () => ({
    gameList: [] as GameList[],
    path: '',
    page_size: 20,
    page_num: 1,
    vendor_code: 'xgd',
    scrollToBottom: false
  }),

  actions: {
    // 取得遊戲清單
    async getGameList(): Promise<CustomAxiosResponse<GameListResult>> {
      const params = {
        m_code: import.meta.env.VITE_M_CODE,
        lang: 'zh',
        page_size: this.page_size,
        page_num: this.page_num,
        vendor_code: this.vendor_code
      }

      // 請求 API
      const res = await getGameListAPI(params) as GameListResponse

      // 判斷是否還有下一頁
      if (res.result) {
        if (res.result.path) this.path = res.result.path

        const isNoData = !res.result.data || res.result.data.length === 0
        if (isNoData) {
          this.$patch({
            scrollToBottom: true
          });
        } else {
          this.$patch({
            scrollToBottom: false,
            page_num: this.page_num + 1
          });
        }
      }

      return res;
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

      const res = await launchGameAPI(params) as LaunchGameResponse
      return res
    }
  }

})
