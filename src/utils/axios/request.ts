import axios from 'axios'
import type { AxiosInstance } from 'axios'
// import { useDialogStore } from '@/stores/dialog'

// create an axios instance
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 500000
})
// Pinia Vuex
// const dialogStore = useDialogStore()

/*
  [請求超時設置]
*/
// timeout 請求時限
axios.defaults.timeout = 5000

// [發出請求] request interceptor
service.interceptors.request.use(
  (config) => {
    console.log(
      `%c👨‍💻 F2E Request:%c${config.url}`,
      'background:#3F51B5; padding: 3px; border-radius: 5px; color: #fff;',
      'padding: 3px;',
      config.data
    )

    return config
  },
  (error) => {
    console.error(`❌ 發生錯誤：${error}`) // for debug
    return Promise.reject(error)
  }
)

// [回應] response interceptor
service.interceptors.response.use(
  async (response: any) => {
    console.log(
      `%c🔌 API Response:%c${response.config.url}`,
      'background:deepskyblue; padding: 3px; border-radius: 5px; color: #fff;',
      'padding: 3px;',
      response?.data
    )

    try {
      return response.data
    } catch (jsError) {
      // 捕捉到錯誤
      console.error('❌發生錯誤(request.js:51)', jsError)
    } finally {
      // 隱藏 PreLoader
    }
  },
  // [Error] Catch
  async (error) => {
    /*
      Axios error 屬性
      - error.config
      - error.statusCode
      - error.response
        - response.data
        - response.status
        - response.headers
      - error.request
      - error.message
    */

    // 捕捉到錯誤，像是 500 錯誤，會執行以下程式碼
    console.error('[request.js:86] DEBUG: ⛔ 請求發生錯誤：' + error)
    // dialogStore.showAlert({
    //   icon: 'fail',
    //   text: '发生错误'
    // })
    return Promise.reject(error)
  }
)

export default service
