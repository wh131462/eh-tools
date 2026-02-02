/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types'
import { DEFAULT_USER_INFO } from '@/types'
import { storage, STORAGE_KEYS } from '@/utils'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo>(
    storage.get<UserInfo>(STORAGE_KEYS.USER_INFO) || { ...DEFAULT_USER_INFO }
  )

  // 登录
  function login(avatar: string, nickname: string) {
    userInfo.value = {
      avatar,
      nickname,
      isLogin: true
    }
    saveToStorage()
  }

  // 更新用户信息
  function updateUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
    saveToStorage()
  }

  // 退出登录
  function logout() {
    userInfo.value = { ...DEFAULT_USER_INFO }
    storage.remove(STORAGE_KEYS.USER_INFO)
  }

  // 保存到本地存储
  function saveToStorage() {
    storage.set(STORAGE_KEYS.USER_INFO, userInfo.value)
  }

  return {
    userInfo,
    login,
    updateUserInfo,
    logout
  }
})
