/**
 * 类型定义 - 用户
 */

export interface UserInfo {
  avatar: string
  nickname: string
  isLogin: boolean
}

export const DEFAULT_USER_INFO: UserInfo = {
  avatar: '',
  nickname: '',
  isLogin: false
}
