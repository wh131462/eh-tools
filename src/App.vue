<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

onLaunch(() => {
  console.log('App Launch')
  // 初始化主题
  const settingsStore = useSettingsStore()
  settingsStore.initTheme()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式在 main.ts 中引入 */
</style>
