/*
  Telegram 第三方登入
*/

const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME

/**
 * Telegram 回傳的 USER 資訊
 * {
      "id": 358617252,
      "first_name": "Hazel",
      "username": "heerherw",
      "photo_url": "https://t.me/i/userpic/320/GeahPT2_TZEl-DY82bJ2qc6njc-O3-D2N1ERwJqzN6w.jpg",
      "auth_date": 1719792553,
      "hash": "5c88007f0f921ee0d955c21c2b17d5d86e9e55650e7fe18faea3361607c00057"
    }
*/
export interface TelegramUserData {
  id: string
  first_name: string
  username: string
  photo_url: string
  auth_date: number
  hash: string
}

// 載入 Telegram Widget script ，載入後會顯示第三方登入按鈕
export function loadTelegramWidget() {
  const container = document.getElementById('telegram-login-container')
  if (container && !document.getElementById('telegram-login-script')) {
    const script = document.createElement('script')
    script.id = 'telegram-login-script'
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'small')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-radius', '10')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    container.appendChild(script)
  }
}
