import request from '@/utils/axios/request'
import type { AxiosResponse } from 'axios'
/*
  玩家相關的 API

  - 玩家註冊
  - 玩家登入
  - 取得玩家資訊
  - 更新玩家資訊
  - Ton錢包下分
*/

/*
  Type 定義資料型態
*/
// 定義註冊資料
export interface PlayerRegisterData {
  m_code: string
  account: string
  password: string
}

// 註冊後預期 Response 回應型態
export interface PlayerRegisterResponse {
  status?: string
  code: string
  message: string
  trace: string
}

// 登入後預期 Response 回應型態
export interface PlayerLoginResponse {
  code: string
  message: string
  trace: string
  result: {
    account: string
    balance: number
    balance_frozen: number
    ton_wallet: string
    vip_id: number
    status: string
  }
}

/*
  API
*/

// 註冊
export function playerRegisterAPI(data: PlayerRegisterData): Promise<PlayerRegisterResponse> {
  return request({
    url: '/api/v1/m/player/reg',
    method: 'post',
    data
  })
}

/* 
  登入
  {
    "code": "0",
    "message": "成功",
    "result": {
        "account": "qn6358617252",
        "balance": 0,
        "balance_frozen": 0,
        "ton_wallet": "UQCEWliDrPXL7lxtKtcHSyCofPV4AibCGgM8VrexQxgeMMIe",
        "vip_id": 0,
        "status": "1"
    },
    "trace": "5b1fab9128b4cdcada41c7ca505fad58"
  }
*/
export function playerLoginAPI(data: PlayerRegisterData): Promise<PlayerLoginResponse> {
  return request({
    url: '/api/v1/m/player/login',
    method: 'post',
    data
  })
}

// 取得玩家資訊
export function getPlayerInfoAPI(data) {
  return request({
    url: '/api/v1/m/player/m/player/info',
    method: 'post',
    data
  })
}

// 更新玩家資訊
export function updatePlayerInfoAPI(data) {
  return request({
    url: '/api/v1/m/player/m/player/update',
    method: 'post',
    data
  })
}

// Ton 錢包下分
export function tonWalletWithdrawAPI(data) {
  return request({
    url: '/api/v1/m/trans/ton_withdraw',
    method: 'post',
    data
  })
}
