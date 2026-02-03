<template>
  <!-- 使用 Canvas 2D API - 隐藏在屏幕外 -->
  <canvas
    type="2d"
    :id="canvasId"
    class="share-canvas-hidden"
    :style="{
      width: width + 'px',
      height: height + 'px'
    }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { generateToolShareImage, generateHomeShareImage, type ToolShareImageConfig } from '@/utils/shareCanvas'

const props = withDefaults(defineProps<{
  /** Canvas ID */
  canvasId?: string
  /** 工具分享图配置 */
  config?: ToolShareImageConfig
  /** Canvas 宽度 */
  width?: number
  /** Canvas 高度 */
  height?: number
  /** 延迟生成时间（毫秒） */
  delay?: number
  /** 分享图类型：tool-工具分享图，home-首页分享图 */
  shareType?: 'tool' | 'home'
}>(), {
  canvasId: 'toolShareCanvas',
  width: 600,
  height: 480,
  delay: 500,
  shareType: 'tool',
})

const emit = defineEmits<{
  (e: 'generated', url: string): void
  (e: 'error', error: any): void
}>()

// 获取组件实例
const instance = getCurrentInstance()

const imageReady = ref(false)
const imageUrl = ref('')
const retryCount = ref(0)
const maxRetries = 3
const isGenerating = ref(false)

async function generateImage() {
  // 防止重复生成
  if (imageReady.value || isGenerating.value) return

  isGenerating.value = true
  const name = props.shareType === 'home' ? '首页' : props.config?.toolName
  console.log(`[ShareCanvas] 开始生成分享图: ${name}, canvasId: ${props.canvasId}`)

  try {
    await nextTick()
    // 等待 Canvas 完全渲染
    await new Promise(resolve => setTimeout(resolve, 300))

    let url: string

    if (props.shareType === 'home') {
      // 首页专属分享图
      url = await generateHomeShareImage(
        props.canvasId,
        props.width,
        props.height,
        instance?.proxy
      )
    } else {
      // 工具分享图
      if (!props.config) {
        throw new Error('工具分享图需要提供 config')
      }
      url = await generateToolShareImage(
        props.canvasId,
        props.config,
        props.width,
        props.height,
        instance?.proxy
      )
    }

    if (url) {
      imageUrl.value = url
      imageReady.value = true
      isGenerating.value = false
      console.log(`[ShareCanvas] 分享图生成成功: ${name}`, url)
      emit('generated', url)
    } else {
      throw new Error('生成的 URL 为空')
    }
  } catch (error) {
    isGenerating.value = false
    console.error(`[ShareCanvas] 分享图生成失败 (${name}):`, error)

    // 重试
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`[ShareCanvas] 重试第 ${retryCount.value} 次...`)
      await new Promise(resolve => setTimeout(resolve, 800))
      await generateImage()
    } else {
      emit('error', error)
    }
  }
}

// 监听配置变化，重新生成
watch(() => props.config, () => {
  if (imageReady.value && props.shareType === 'tool') {
    imageReady.value = false
    retryCount.value = 0
    setTimeout(generateImage, 300)
  }
}, { deep: true })

onMounted(() => {
  const name = props.shareType === 'home' ? '首页' : props.config?.toolName
  console.log(`[ShareCanvas] 组件挂载: ${name}`)
  setTimeout(generateImage, props.delay)
})

// 页面显示时，如果之前生成失败，重新尝试
onShow(() => {
  if (!imageReady.value && !isGenerating.value) {
    const name = props.shareType === 'home' ? '首页' : props.config?.toolName
    console.log(`[ShareCanvas] 页面显示，重新尝试生成: ${name}`)
    retryCount.value = 0
    setTimeout(generateImage, 300)
  }
})

defineExpose({
  imageUrl,
  imageReady,
  regenerate: () => {
    imageReady.value = false
    isGenerating.value = false
    retryCount.value = 0
    return generateImage()
  },
})
</script>

<style lang="scss" scoped>
.share-canvas-hidden {
  /* 隐藏 Canvas 但保持正确尺寸以便绘制 */
  position: fixed !important;
  left: 200vw !important;
  top: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>
