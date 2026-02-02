/**
 * 设置状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage, STORAGE_KEYS } from '@/utils'
import type { ToolCategory } from '@/types'

export type Language = 'zh' | 'en'
export type ThemeMode = 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  // 语言设置
  const language = ref<Language>(
    storage.get<Language>(STORAGE_KEYS.APP_LANGUAGE) || 'zh'
  )

  // 工具列表页面的当前分类（用于 switchTab 传参）
  const toolsCategory = ref<ToolCategory | null>(null)

  // 主题模式
  const themeMode = ref<ThemeMode>(
    storage.get<ThemeMode>(STORAGE_KEYS.THEME_MODE) || 'light'
  )

  // 是否为暗黑模式
  const isDark = computed(() => themeMode.value === 'dark')

  // 切换语言
  function setLanguage(lang: Language) {
    language.value = lang
    storage.set(STORAGE_KEYS.APP_LANGUAGE, lang)
  }

  // 切换主题
  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
    storage.set(STORAGE_KEYS.THEME_MODE, mode)
    applyTheme(mode)
  }

  // 应用主题
  function applyTheme(mode: ThemeMode) {
    const dark = mode === 'dark'

    // 设置导航栏颜色
    try {
      uni.setNavigationBarColor({
        frontColor: dark ? '#ffffff' : '#000000',
        backgroundColor: dark ? '#1a1a2e' : '#FFFFFF',
        fail: () => {}
      })
    } catch {
      // 忽略异常
    }

    // 设置页面背景色（解决暗黑模式下顶部白条问题）
    try {
      uni.setBackgroundColor({
        backgroundColor: dark ? '#1a1a2e' : '#F5F7FA',
        backgroundColorTop: dark ? '#1a1a2e' : '#FFFFFF',
        backgroundColorBottom: dark ? '#1a1a2e' : '#F5F7FA',
        fail: () => {}
      })
    } catch {
      // 忽略异常
    }

    // 注意：项目使用了自定义 TabBar，无法使用 uni.setTabBarStyle() API
    // TabBar 的主题样式已在 FloatTabBar.vue 组件中通过 CSS 类适配

    // 通过全局事件通知主题变化，让各页面更新 class
    uni.$emit('theme-change', { isDark: dark, mode })
  }

  // 初始化主题
  function initTheme() {
    applyTheme(themeMode.value)
  }

  // 设置工具列表分类
  function setToolsCategory(category: ToolCategory | null) {
    toolsCategory.value = category
  }

  return {
    language,
    themeMode,
    toolsCategory,
    isDark,
    setLanguage,
    setThemeMode,
    initTheme,
    setToolsCategory
  }
})
