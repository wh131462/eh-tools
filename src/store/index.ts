/**
 * Pinia Store 入口
 */
import { createPinia } from 'pinia'

export const pinia = createPinia()

// 导出所有 store
export * from './modules/user'
export * from './modules/settings'
export * from './modules/wheel'
export * from './modules/favorites'
export * from './modules/recent'
