/*
  Telegram 第三方登入
*/

const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME
const botID = import.meta.env.VITE_TELEGRAM_BOT_ID
const botSecret = import.meta.env.VITE_TELEGRAM_BOT_SECRET
const redirectUrl = location.href
const REDIRECT_URI = `https://ui-ton-wallet.vercel.app/`
export const telegramOauth = `https://oauth.telegram.org/auth?bot_id=${botID}&origin=${redirectUrl}&request_access=write`

export const getTelegramAuthUrl = (callback: any) => {
  const redirectUrl = encodeURIComponent('https://ui-ton-wallet.vercel.app/')

  // 檢查是否在移動設備上
  const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log('isMobile', isMobile)

  if (isMobile) {
    // 移動設備使用 tg:// 協議
    // return `tg://resolve?domain=oauth?bot_id=${botID}&origin=${redirectUrl}`;
    const authUrl = `tg://resolve?domain=${botName}&start=auth_${redirectUrl}`;
    return authUrl
  } else {
    // 桌面設備使用網頁版 Telegram
    callback()
    // const publicKey = '213984ujqwkafjnaiow4uy5q398498374*(#4@@DERAW2413AWSR('
    // const authUrl = `https://oauth.telegram.org/auth?bot_id=${botID}&origin=${redirectUrl}&request_access=write&public_key=${publicKey}`;
    // return authUrl
  }
}


export function usingCodeToGetAccessToken() {
  const urlParams = new URLSearchParams(
    window.location.search
  )
  const code = urlParams.get('code')

  if (code) {
    const data = {
      client_id: botID,
      client_secret: botSecret,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }

    const tokenUrl = `https://oauth.telegram.org/token`;

    fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(data => {
        const accessToken = data.access_token;
        // 使用訪問令牌獲取用戶信息
        fetch(`https://api.telegram.org/bot${botID}:${accessToken}/getMe`)
          .then(response => response.json())
          .then(userInfo => {
            console.log('======================')
            console.error('User Info:', userInfo);
            console.log('======================')
          });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

}

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
