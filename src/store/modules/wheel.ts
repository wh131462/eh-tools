/**
 * 转盘状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { WheelConfig, WheelHistory } from '@/types'
import { PRESET_CONFIGS } from '@/types'
import { storage, STORAGE_KEYS } from '@/utils'

const MAX_HISTORY = 100

export const useWheelStore = defineStore('wheel', () => {
  // 配置列表 - 确保空数组时使用预设配置
  const storedConfigs = storage.get<WheelConfig[]>(STORAGE_KEYS.WHEEL_CONFIGS)
  const configs = ref<WheelConfig[]>(
    storedConfigs && storedConfigs.length > 0 ? storedConfigs : [...PRESET_CONFIGS]
  )

  // 当前选中的配置 ID - 确保 ID 有效
  const storedConfigId = storage.get<string>(STORAGE_KEYS.WHEEL_CURRENT_CONFIG)
  const initialConfigId = storedConfigId && configs.value.some(c => c.id === storedConfigId)
    ? storedConfigId
    : configs.value[0]?.id || ''
  const currentConfigId = ref<string>(initialConfigId)

  // 历史记录
  const history = ref<WheelHistory[]>(
    storage.get<WheelHistory[]>(STORAGE_KEYS.WHEEL_HISTORY) || []
  )

  // 获取当前配置
  function getCurrentConfig(): WheelConfig | undefined {
    return configs.value.find(c => c.id === currentConfigId.value)
  }

  // 设置当前配置
  function setCurrentConfig(id: string) {
    currentConfigId.value = id
    storage.set(STORAGE_KEYS.WHEEL_CURRENT_CONFIG, id)
  }

  // 添加配置
  function addConfig(config: WheelConfig) {
    configs.value.push(config)
    saveConfigs()
  }

  // 更新配置
  function updateConfig(config: WheelConfig) {
    const index = configs.value.findIndex(c => c.id === config.id)
    if (index !== -1) {
      configs.value[index] = config
      saveConfigs()
    }
  }

  // 删除配置
  function deleteConfig(id: string) {
    const index = configs.value.findIndex(c => c.id === id)
    if (index !== -1) {
      configs.value.splice(index, 1)
      // 如果删除的是当前配置，切换到第一个
      if (currentConfigId.value === id) {
        const newId = configs.value.length > 0 ? configs.value[0].id : ''
        currentConfigId.value = newId
        storage.set(STORAGE_KEYS.WHEEL_CURRENT_CONFIG, newId)
      }
      // 如果所有配置都被删除，恢复预设配置
      if (configs.value.length === 0) {
        configs.value = [...PRESET_CONFIGS]
        currentConfigId.value = configs.value[0].id
        storage.set(STORAGE_KEYS.WHEEL_CURRENT_CONFIG, configs.value[0].id)
      }
      saveConfigs()
    }
  }

  // 添加历史记录
  function addHistory(record: Omit<WheelHistory, 'id' | 'timestamp'>) {
    const newRecord: WheelHistory = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    history.value.unshift(newRecord)
    // 限制最大数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    saveHistory()
  }

  // 删除历史记录
  function deleteHistory(id: string) {
    const index = history.value.findIndex(h => h.id === id)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveHistory()
    }
  }

  // 清空历史记录
  function clearHistory() {
    history.value = []
    saveHistory()
  }

  // 保存配置到本地
  function saveConfigs() {
    storage.set(STORAGE_KEYS.WHEEL_CONFIGS, configs.value)
  }

  // 保存历史到本地
  function saveHistory() {
    storage.set(STORAGE_KEYS.WHEEL_HISTORY, history.value)
  }

  return {
    configs,
    currentConfigId,
    history,
    getCurrentConfig,
    setCurrentConfig,
    addConfig,
    updateConfig,
    deleteConfig,
    addHistory,
    deleteHistory,
    clearHistory
  }
})
