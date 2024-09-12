import type { TelegramUserData } from '@/utils/telegram/telegramLogin'

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUserData) => void
    Telegram: {
      Login: {
        auth(options: TelegramAuthOptions, callback: (data: TelegramUserData) => void): void
      },
      WebApp: {
        ready(): void;
        openTelegramLink(url): void
      }
    },
    CsCashierClose?: () => void;
  }
}
