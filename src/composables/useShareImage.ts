/**
 * 分享图生成 composable
 * 用于在页面中动态生成分享封面图
 */
import { ref, onMounted, nextTick } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import {
  generateToolShareImage,
  THEME_COLORS,
  TOOL_ICONS,
  type ToolShareImageConfig
} from '@/utils/shareCanvas'

export interface UseShareImageOptions {
  /** 工具/页面名称 */
  toolName: string
  /** 工具 ID（用于获取图标） */
  toolId?: string
  /** 页面路径 */
  path: string
  /** 分类（用于主题色） */
  category?: 'time' | 'calc' | 'text' | 'image' | 'life' | 'default'
  /** 自定义图标 */
  icon?: string
  /** 副标题 */
  subtitle?: string
  /** 自定义主色 */
  primaryColor?: string
  /** 自定义次色 */
  secondaryColor?: string
  /** Canvas ID */
  canvasId?: string
  /** 是否启用朋友圈分享 */
  enableTimeline?: boolean
}

/**
 * 使用分享图功能
 *
 * @example
 * ```vue
 * <template>
 *   <view>
 *     <!-- 页面内容 -->
 *     <canvas
 *       v-if="!shareImageReady"
 *       :canvas-id="canvasId"
 *       :style="{ width: '600px', height: '480px', position: 'fixed', left: '-9999px' }"
 *     />
 *   </view>
 * </template>
 *
 * <script setup>
 * const { canvasId, shareImageReady } = useShareImage({
 *   toolName: t('bmi.title'),
 *   toolId: 'bmi',
 *   path: '/pages/calc/bmi/index',
 *   category: 'calc'
 * })
 * </script>
 * ```
 */
export function useShareImage(options: UseShareImageOptions) {
  const {
    toolName,
    toolId,
    path,
    category = 'default',
    icon,
    subtitle,
    primaryColor,
    secondaryColor,
    canvasId = 'shareImageCanvas',
    enableTimeline = true,
  } = options

  // 状态
  const shareImageUrl = ref('')
  const shareImageReady = ref(false)
  const isGenerating = ref(false)

  // 获取图标
  const toolIcon = icon || (toolId ? TOOL_ICONS[toolId] : undefined) || '🔧'

  // 获取主题色
  const theme = THEME_COLORS[category] || THEME_COLORS.default
  const finalPrimaryColor = primaryColor || theme.primary
  const finalSecondaryColor = secondaryColor || theme.secondary

  // 生成分享图
  async function generateImage() {
    if (isGenerating.value || shareImageReady.value) return

    isGenerating.value = true

    try {
      await nextTick()

      // 等待 Canvas 挂载
      await new Promise(resolve => setTimeout(resolve, 500))

      const config: ToolShareImageConfig = {
        toolName,
        icon: toolIcon,
        category,
        subtitle,
        primaryColor: finalPrimaryColor,
        secondaryColor: finalSecondaryColor,
      }

      const url = await generateToolShareImage(canvasId, config)
      shareImageUrl.value = url
      shareImageReady.value = true
      console.log(`[${toolName}] 分享图生成成功`)
    } catch (error) {
      console.error(`[${toolName}] 分享图生成失败:`, error)
    } finally {
      isGenerating.value = false
    }
  }

  // 获取分享配置
  function getShareConfig() {
    return {
      title: `EH Tools - ${toolName}`,
      path,
      imageUrl: shareImageUrl.value || '/static/eh-tools-logo.png',
    }
  }

  // 配置分享
  onShareAppMessage(() => getShareConfig())

  if (enableTimeline) {
    onShareTimeline(() => ({
      title: `EH Tools - ${toolName}`,
    }))
  }

  // 页面加载时生成分享图
  onMounted(() => {
    // 延迟生成，避免影响页面渲染
    setTimeout(generateImage, 1000)
  })

  return {
    /** Canvas ID */
    canvasId,
    /** 分享图 URL */
    shareImageUrl,
    /** 分享图是否已生成 */
    shareImageReady,
    /** 是否正在生成 */
    isGenerating,
    /** 手动生成分享图 */
    generateImage,
    /** 获取分享配置 */
    getShareConfig,
    /** 工具图标 */
    toolIcon,
    /** 主题色 */
    themeColors: {
      primary: finalPrimaryColor,
      secondary: finalSecondaryColor,
    },
  }
}

/**
 * 简化版：只配置分享，不生成动态图片
 * 适用于不需要动态生成分享图的页面
 */
export function useSimpleShare(options: {
  title: string
  path: string
  enableTimeline?: boolean
}) {
  const { title, path, enableTimeline = true } = options

  onShareAppMessage(() => ({
    title: `EH Tools - ${title}`,
    path,
    imageUrl: '/static/eh-tools-logo.png',
  }))

  if (enableTimeline) {
    onShareTimeline(() => ({
      title: `EH Tools - ${title}`,
    }))
  }
}

export default useShareImage
