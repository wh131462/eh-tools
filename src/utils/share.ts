/**
 * 分享配置
 */

export interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
}

/**
 * 获取默认分享配置
 */
export function getDefaultShareConfig(): ShareConfig {
  return {
    title: 'EH Tools - 实用工具集合',
    path: '/pages/index/index',
    imageUrl: '/static/images/share.png'
  }
}

/**
 * 获取页面分享配置
 */
export function getPageShareConfig(title: string, path: string): ShareConfig {
  return {
    title: `EH Tools - ${title}`,
    path,
    imageUrl: '/static/images/share.png'
  }
}
