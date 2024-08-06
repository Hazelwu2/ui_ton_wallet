import request from '@/utils/axios/request'

enum Api {
  Register = '/api/v1/m/player/reg',
  TgAuth = '/api/v1/tg/auth',
  Login = '/api/v1/m/player/login',
  GetPlayerInfo = '/api/v1/m/player/info',
  UpdatePlayerInfo = '/api/v1/m/player/update',
  CryptoWalletWithdraw = '/m/trans/crypto_withdraw'
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
    withdraw_wallet: string
    deposit_wallet: string
    vip_id: number
    status: string
  }
}

export interface CryptoWalletWithdrawData {
  m_code: string
  account: string
  password: string
  transfer_amount: number
}

export interface CryptoWalletWithdrawResponse {
  code: string
  message: string
  trace?: string
}

export interface PlayerInfo {
  account: string
  balance: number
  balance_frozen: number
  withdraw_wallet: string
  deposit_wallet: string
  vip_id: number
  status: string
}
export interface GetPlayerInfoParams extends PlayerRegisterData { }
export interface GetPlayerInfoResponse {
  code: string
  message: string
  result?: PlayerInfo
  trace: string
}

export interface UpdatePlayerInfoParams {
  m_code: string
  account: string
  password: string
  nickname?: string
  withdraw_wallet: string
  deposit_wallet?: string
}

export interface UpdatePlayerInfoResponse extends PlayerRegisterResponse {

}
/** 
 * @description: 註冊
 */
export function TgAuthAPI(data: PlayerRegisterData): Promise<PlayerRegisterResponse> {
  return request({
    url: Api.TgAuth,
    method: 'post',
    data
  })
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
export function getPlayerInfoAPI(data: GetPlayerInfoParams): Promise<GetPlayerInfoResponse> {
  return request({
    url: Api.GetPlayerInfo,
    method: 'post',
    data
  })
}

/** 
 * @description: 更新玩家資訊
 */
export function updatePlayerInfoAPI(data: UpdatePlayerInfoParams): Promise<UpdatePlayerInfoResponse> {
  return request({
    url: Api.UpdatePlayerInfo,
    method: 'post',
    data
  })
}

/** 
 * @description: 錢包下分
 */
export function cryptoWalletWithdrawAPI(data: CryptoWalletWithdrawData): Promise<CryptoWalletWithdrawResponse> {
  return request({
    url: Api.CryptoWalletWithdraw,
    method: 'post',
    data
  })
}
