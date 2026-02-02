import { createSSRApp } from 'vue'
import App from './App.vue'
import { pinia } from './store'
import i18n from './i18n'

// 全局样式
import './styles/index.scss'

export function createApp() {
  const app = createSSRApp(App)

  // 注册 Pinia
  app.use(pinia)

  // 注册 i18n
  app.use(i18n)

  return {
    app
  }
}
