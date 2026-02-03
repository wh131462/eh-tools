/**
 * 本地存储封装
 */

export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const value = uni.getStorageSync(key)
      if (value === '' || value === undefined || value === null) {
        return defaultValue ?? null
      }
      return value as T
    } catch {
      return defaultValue ?? null
    }
  },

  set(key: string, value: any): boolean {
    try {
      uni.setStorageSync(key, value)
      return true
    } catch {
      return false
    }
  },

  remove(key: string): boolean {
    try {
      uni.removeStorageSync(key)
      return true
    } catch {
      return false
    }
  },

  clear(): boolean {
    try {
      uni.clearStorageSync()
      return true
    } catch {
      return false
    }
  }
}

// 存储 Key 常量
export const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  APP_LANGUAGE: 'app_language',
  THEME_MODE: 'theme_mode',
  COLOR_CARD_FAVORITES: 'colorCardFavorites',
  SELECTED_TIME_ZONES: 'selectedTimeZones',
  WHEEL_CONFIGS: 'wheel_configs',
  WHEEL_CURRENT_CONFIG: 'wheel_current_config',
  WHEEL_HISTORY: 'wheel_history',
  TOOL_FAVORITES: 'tool_favorites',
  RECENT_TOOLS: 'recent_tools',
  TODO_LISTS: 'todo_lists'
} as const
