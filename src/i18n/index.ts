/**
 * i18n 国际化配置
 */
import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'
import { storage, STORAGE_KEYS } from '@/utils'

export type MessageSchema = typeof zh

// 获取存储的语言设置
const savedLanguage = storage.get<string>(STORAGE_KEYS.APP_LANGUAGE) || 'zh'

export const i18n = createI18n<[MessageSchema], 'zh' | 'en'>({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'zh',
  messages: {
    zh,
    en
  }
})

// 切换语言
export function setLocale(locale: 'zh' | 'en') {
  i18n.global.locale.value = locale
  storage.set(STORAGE_KEYS.APP_LANGUAGE, locale)
}

// 获取当前语言
export function getLocale(): 'zh' | 'en' {
  return i18n.global.locale.value as 'zh' | 'en'
}

// 翻译函数快捷方式
export function t(key: string, params?: Record<string, any>): string {
  return i18n.global.t(key, params || {})
}

export default i18n
