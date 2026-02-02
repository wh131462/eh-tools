/**
 * 收藏状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage, STORAGE_KEYS } from '@/utils'

export const useFavoritesStore = defineStore('favorites', () => {
  // 收藏的工具 ID 列表
  const favorites = ref<string[]>(
    storage.get<string[]>(STORAGE_KEYS.TOOL_FAVORITES) || []
  )

  // 添加收藏
  function addFavorite(toolId: string) {
    if (!favorites.value.includes(toolId)) {
      favorites.value.push(toolId)
      saveFavorites()
    }
  }

  // 移除收藏
  function removeFavorite(toolId: string) {
    const index = favorites.value.indexOf(toolId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  // 切换收藏状态
  function toggleFavorite(toolId: string) {
    if (isFavorite(toolId)) {
      removeFavorite(toolId)
    } else {
      addFavorite(toolId)
    }
  }

  // 检查是否已收藏
  function isFavorite(toolId: string): boolean {
    return favorites.value.includes(toolId)
  }

  // 保存到本地存储
  function saveFavorites() {
    storage.set(STORAGE_KEYS.TOOL_FAVORITES, favorites.value)
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  }
})
