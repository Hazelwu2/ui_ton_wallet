
declare global {
  interface Window {
    CsCashierClose?: () => void;
    onTelegramAuth: (user: TelegramUserData) => void;
    Telegram: {
      Login: {
        auth(options: TelegramAuthOptions, callback: (data: TelegramUserData) => void): void
      },
      WebApp: {
        ready(): void;
        openLink(url): void;
        initData: any;
      }
    },
  }
}

import 'vue'
import type { TelegramUserData } from '@/utils/telegram/telegramLogin'

declare module 'vue' {
  interface ComponentCustomProperties {
    $isTelegramMiniApp: boolean
  }
}