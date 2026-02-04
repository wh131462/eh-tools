<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store'

/**
 * 检查小程序更新
 * 自动检测并下载新版本，下载完成后询问用户是否重启更新
 */
function checkAppUpdate() {
  // #ifdef MP-WEIXIN
  if (!uni.canIUse('getUpdateManager')) {
    console.log('当前微信版本不支持 getUpdateManager')
    return
  }

  const updateManager = uni.getUpdateManager()

  // 检测到新版本
  updateManager.onCheckForUpdate((res) => {
    if (res.hasUpdate) {
      console.log('检测到新版本，正在后台下载...')
    }
  })

  // 新版本下载完成
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已下载完成，是否立即重启应用？',
      confirmText: '立即更新',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          // 强制重启并应用新版本
          updateManager.applyUpdate()
        }
      }
    })
  })

  // 新版本下载失败
  updateManager.onUpdateFailed(() => {
    uni.showModal({
      title: '更新失败',
      content: '新版本下载失败，请检查网络后重试，或删除小程序重新搜索打开',
      showCancel: false,
      confirmText: '我知道了'
    })
  })
  // #endif
}

onLaunch(() => {
  console.log('App Launch')
  // 初始化主题
  const settingsStore = useSettingsStore()
  settingsStore.initTheme()

  // 检查小程序更新
  checkAppUpdate()
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
