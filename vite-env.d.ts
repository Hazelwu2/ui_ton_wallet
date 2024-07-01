/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TELEGRAM_BOT_TOKEN: string
  readonly VITE_TELEGRAM_BOT_NAME: string
  readonly VITE_API_URL: string
  readonly VITE_M_CODE: string
  readonly VITE_PLAYER_PASSWORD: string
  readonly VITE_TELEGRAM_BOT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
