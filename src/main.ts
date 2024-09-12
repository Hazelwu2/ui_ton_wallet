import './assets/main.css'

import { createApp } from 'vue'
import pinia from './stores'

// UI Library: Vuetify
import vuetify from '@/plugins/vuetify'

import App from './App.vue'
import router from './router'



const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')

// 檢測是否在 Telegram Mini App 中運行
const isTelegramMiniApp = !!window.Telegram && !!window.Telegram.WebApp
// 將結果添加到全局屬性中
app.config.globalProperties.$isTelegramMiniApp = isTelegramMiniApp

// 如果在 Telegram Mini App 中，初始化 WebApp
if (isTelegramMiniApp) {
  window?.Telegram?.WebApp.ready()
}