import request from '@/utils/axios/request'
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
export interface GameListParams {
  m_code: string
  lang: string
  page_size: number
  page_num: number
  vendor_code: string
}

export interface GameList {
  vendor_code: string
  game_type: string
  game_code: string
  launch_code: string
  name: string
  pic: string
  tags: string
  game_tag: string
  sort_order: number
  status: string
}

export interface GameListResult {
  path: string
  data: GameList[]
}

// 
export interface GameListResponse {
  code: string
  message: string
  trace?: string
  result?: GameListResult
}

export interface LaunchGameParams {
  m_code: string
  account: string
  launch_code: string
  lang: string
}

export interface LaunchGameResponse {
  code: string
  message: string
  trace?: string
  result?: {
    url?: string
  }
}

/*
  API
*/

/* 
  取得遊戲清單
*/
export function getGameListAPI(data: GameListParams): Promise<GameListResponse> {
  return request({
    url: '/api/v1/m/game/list',
    method: 'post',
    data
  })
}

/* 
  啟動遊戲
*/
export function launchGameAPI(data: LaunchGameParams): Promise<LaunchGameResponse> {
  return request({
    url: '/api/v1/m/game/launch',
    method: 'post',
    data
  })
}