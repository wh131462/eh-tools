/**
 * 分享配置工具
 * 支持微信小程序的分享功能
 */

// 默认分享图路径（暂时使用 logo，后续可以替换）
const DEFAULT_SHARE_IMAGE = '/static/eh-tools-logo.png'

/**
 * 分享配置接口
 */
export interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
}

/**
 * 朋友圈分享配置接口
 */
export interface TimelineShareConfig {
  title: string
  query?: string
  imageUrl?: string
}

/**
 * 工具分享配置接口
 */
export interface ToolShareConfig {
  toolName: string
  toolNameEn?: string
  path: string
  query?: Record<string, string | number>
  imageUrl?: string
}

/**
 * 获取默认分享配置
 */
export function getDefaultShareConfig(): ShareConfig {
  return {
    title: 'EH Tools - 实用工具集合',
    path: '/pages/index/index',
    imageUrl: DEFAULT_SHARE_IMAGE
  }
}

/**
 * 获取页面分享配置
 * @param title 页面标题
 * @param path 页面路径
 * @param imageUrl 可选的分享图片
 */
export function getPageShareConfig(
  title: string,
  path: string,
  imageUrl?: string
): ShareConfig {
  return {
    title: `EH Tools - ${title}`,
    path,
    imageUrl: imageUrl || DEFAULT_SHARE_IMAGE
  }
}

/**
 * 获取工具分享配置
 * @param config 工具分享配置
 */
export function getToolShareConfig(config: ToolShareConfig): ShareConfig {
  let path = config.path
  if (config.query && Object.keys(config.query).length > 0) {
    const queryString = Object.entries(config.query)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    path = `${path}?${queryString}`
  }

  return {
    title: `EH Tools - ${config.toolName}`,
    path,
    imageUrl: config.imageUrl || DEFAULT_SHARE_IMAGE
  }
}

/**
 * 获取朋友圈分享配置
 * @param title 分享标题
 * @param query 可选的查询参数
 * @param imageUrl 可选的分享图片
 */
export function getTimelineShareConfig(
  title: string,
  query?: string,
  imageUrl?: string
): TimelineShareConfig {
  return {
    title: `EH Tools - ${title}`,
    query,
    imageUrl: imageUrl || DEFAULT_SHARE_IMAGE
  }
}

/**
 * 获取结果分享配置（用于分享计算结果等）
 * @param toolName 工具名称
 * @param resultText 结果描述文字
 * @param path 页面路径
 * @param imageUrl 分享图片（动态生成的结果图）
 */
export function getResultShareConfig(
  toolName: string,
  resultText: string,
  path: string,
  imageUrl?: string
): ShareConfig {
  return {
    title: `${toolName} - ${resultText}`,
    path,
    imageUrl: imageUrl || DEFAULT_SHARE_IMAGE
  }
}

/**
 * 分享配置辅助函数 - 用于快速创建分享配置
 */
export const share = {
  /**
   * 默认分享配置
   */
  default: getDefaultShareConfig,

  /**
   * 页面分享配置
   */
  page: getPageShareConfig,

  /**
   * 工具分享配置
   */
  tool: getToolShareConfig,

  /**
   * 朋友圈分享配置
   */
  timeline: getTimelineShareConfig,

  /**
   * 结果分享配置
   */
  result: getResultShareConfig
}
