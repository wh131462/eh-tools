/**
 * 分享功能 composable
 * 用于简化页面分享配置的添加
 */
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getDefaultShareConfig, getPageShareConfig, getTimelineShareConfig } from '@/utils/share'

export interface UseShareOptions {
  /** 工具名称（用于分享标题） */
  title: string
  /** 页面路径 */
  path: string
  /** 自定义分享图片 */
  imageUrl?: string
  /** 是否启用朋友圈分享（默认 true） */
  enableTimeline?: boolean
  /** 分享给好友的额外 query 参数 */
  query?: Record<string, string | number>
}

/**
 * 使用分享功能
 * @param options 分享配置选项
 *
 * @example
 * ```ts
 * // 基础用法
 * useShare({
 *   title: t('bmi.title'),
 *   path: '/pages/calc/bmi/index'
 * })
 *
 * // 带动态参数
 * useShare({
 *   title: t('bmi.title'),
 *   path: '/pages/calc/bmi/index',
 *   query: { height: 170, weight: 65 }
 * })
 * ```
 */
export function useShare(options: UseShareOptions) {
  const { title, path, imageUrl, enableTimeline = true, query } = options

  // 构建带参数的路径
  let fullPath = path
  if (query && Object.keys(query).length > 0) {
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    fullPath = `${path}?${queryString}`
  }

  // 分享给好友
  onShareAppMessage(() => {
    return getPageShareConfig(title, fullPath, imageUrl)
  })

  // 分享到朋友圈
  if (enableTimeline) {
    onShareTimeline(() => {
      return getTimelineShareConfig(title, query ? Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&') : undefined, imageUrl)
    })
  }
}

/**
 * 使用默认分享功能（分享到首页）
 */
export function useDefaultShare() {
  onShareAppMessage(() => getDefaultShareConfig())
  onShareTimeline(() => ({
    title: 'EH Tools - 实用工具集合'
  }))
}

export default useShare
