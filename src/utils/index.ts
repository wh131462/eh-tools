/**
 * 工具函数统一导出
 */

export * from './storage'
export * from './format'
export * from './permission'
export * from './share'

/**
 * 复制到剪贴板
 */
export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.setClipboardData({
      data: text,
      success: () => {
        uni.showToast({ title: '复制成功', icon: 'success' })
        resolve(true)
      },
      fail: () => {
        uni.showToast({ title: '复制失败', icon: 'none' })
        resolve(false)
      }
    })
  })
}

/**
 * 显示 Toast 提示
 * 当消息过长时自动使用 Modal 代替 Toast
 */
export function showToast(title: string, icon: 'success' | 'error' | 'none' = 'none') {
  // uni.showToast 在小程序中有字符限制（约7个汉字）
  // 超过限制时使用 showModal 代替
  const maxLength = 7

  if (title.length > maxLength) {
    uni.showModal({
      title: icon === 'success' ? '成功' : icon === 'error' ? '错误' : '提示',
      content: title,
      showCancel: false,
      confirmText: '确定'
    })
  } else {
    uni.showToast({
      title,
      icon: icon === 'error' ? 'none' : icon,
      duration: 2000
    })
  }
}

/**
 * 显示确认对话框
 */
export function showConfirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    })
  })
}

/**
 * 页面导航
 */
export function navigateTo(url: string) {
  uni.navigateTo({
    url,
    fail: (err) => {
      console.warn('navigateTo failed:', url, err)
    }
  })
}

export function navigateBack(delta = 1) {
  uni.navigateBack({ delta })
}

export function switchTab(url: string) {
  uni.switchTab({ url })
}

/**
 * 设置导航栏
 */
export function setNavigationBar(title: string, backgroundColor?: string, frontColor?: '#ffffff' | '#000000') {
  uni.setNavigationBarTitle({ title })
  if (backgroundColor) {
    uni.setNavigationBarColor({
      frontColor: frontColor || '#000000',
      backgroundColor
    })
  }
}
