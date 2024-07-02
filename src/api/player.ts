import request from '@/utils/axios/request'

enum Api {
  Register = '/api/v1/m/player/reg',
  Login = '/api/v1/m/player/login',
  GetPlayerInfo = '/api/v1/m/player/m/player/info',
  UpdatePlayerInfo = '/api/v1/m/player/m/player/update',
  TonWalletWithdraw = '/api/v1/m/trans/ton_withdraw'
}

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

export interface TonWalletWithdrawData {
  m_code: string
  account: string
  password: string
  transfer_amount: number
}

export interface TonWalletWithdrawResponse {
  code: string
  message: string
  trace?: string
}

export interface UpdatePlayerInfoParams {
  m_code: string
  account: string
  password: string
  nickname: string
  ton_wallet: string
}
export interface GetPlayerInfoParams extends PlayerRegisterData {

}

/** 
 * @description: 註冊
 */
export function playerRegisterAPI(data: PlayerRegisterData): Promise<PlayerRegisterResponse> {
  return request({
    url: Api.Register,
    method: 'post',
    data
  })
}

/** 
 * @description: 登入
 */
export function playerLoginAPI(data: PlayerRegisterData): Promise<PlayerLoginResponse> {
  return request({
    url: Api.Login,
    method: 'post',
    data
  })
}

/** 
 * @description: 取得玩家資訊
 */
export function getPlayerInfoAPI(data: GetPlayerInfoParams) {
  return request({
    url: Api.GetPlayerInfo,
    method: 'post',
    data
  })
}

/** 
 * @description: 更新玩家資訊
 */
export function updatePlayerInfoAPI(data: UpdatePlayerInfoParams) {
  return request({
    url: Api.UpdatePlayerInfo,
    method: 'post',
    data
  })
}

/** 
 * @description: Ton 錢包下分
 */
export function tonWalletWithdrawAPI(data: TonWalletWithdrawData): Promise<TonWalletWithdrawResponse> {
  return request({
    url: Api.TonWalletWithdraw,
    method: 'post',
    data
  })
}
