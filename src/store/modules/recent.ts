/**
 * 最近使用工具状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, STORAGE_KEYS } from '@/utils'
import { TOOLS, type Tool } from '@/types'

const MAX_RECENT_TOOLS = 10

export const useRecentToolsStore = defineStore('recentTools', () => {
  // 最近使用的工具 ID 列表（按时间倒序）
  const recentToolIds = ref<string[]>(
    storage.get<string[]>(STORAGE_KEYS.RECENT_TOOLS) || []
  )

  // 获取最近使用的工具详情列表
  const recentTools = computed<Tool[]>(() => {
    return recentToolIds.value
      .map(id => TOOLS.find(t => t.id === id))
      .filter((t): t is Tool => !!t)
  })

  // 添加最近使用的工具
  function addRecentTool(toolId: string) {
    // 移除已存在的记录
    const index = recentToolIds.value.indexOf(toolId)
    if (index > -1) {
      recentToolIds.value.splice(index, 1)
    }
    // 添加到最前面
    recentToolIds.value.unshift(toolId)
    // 限制数量
    if (recentToolIds.value.length > MAX_RECENT_TOOLS) {
      recentToolIds.value = recentToolIds.value.slice(0, MAX_RECENT_TOOLS)
    }
    saveRecentTools()
  }

  // 清空最近使用
  function clearRecentTools() {
    recentToolIds.value = []
    saveRecentTools()
  }

  // 保存到本地存储
  function saveRecentTools() {
    storage.set(STORAGE_KEYS.RECENT_TOOLS, recentToolIds.value)
  }

  return {
    recentToolIds,
    recentTools,
    addRecentTool,
    clearRecentTools
  }
})
