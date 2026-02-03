/**
 * 分享图 Canvas 绘制工具
 * 使用 Canvas 2D API（微信小程序推荐方式）
 */

/**
 * 工具分享图配置
 */
export interface ToolShareImageConfig {
  /** 工具名称 */
  toolName: string
  /** 工具图标（emoji） */
  icon?: string
  /** 主题色（渐变起始色） */
  primaryColor?: string
  /** 主题色（渐变结束色） */
  secondaryColor?: string
  /** 副标题/描述 */
  subtitle?: string
  /** 分类名称 */
  category?: string
}

/**
 * 结果分享图配置
 */
export interface ResultShareConfig {
  title: string
  resultLabel: string
  resultValue: string
  resultUnit?: string
  subResults?: Array<{
    label: string
    value: string
  }>
  statusColor?: string
  statusText?: string
  icon?: string
}

// 预设主题色
export const THEME_COLORS: Record<string, { primary: string; secondary: string }> = {
  // 时间类工具 - 蓝紫色
  time: { primary: '#667eea', secondary: '#764ba2' },
  // 计算类工具 - 青绿色
  calc: { primary: '#11998e', secondary: '#38ef7d' },
  // 文本类工具 - 橙黄色
  text: { primary: '#f093fb', secondary: '#f5576c' },
  // 图像类工具 - 粉紫色
  image: { primary: '#4facfe', secondary: '#00f2fe' },
  // 生活类工具 - 橙红色
  life: { primary: '#fa709a', secondary: '#fee140' },
  // 默认 - 紫色
  default: { primary: '#667eea', secondary: '#764ba2' },
}

// 工具图标映射
export const TOOL_ICONS: Record<string, string> = {
  // 时间工具
  calendar: '📅',
  countdown: '⏱️',
  'time-diff': '⏰',
  'world-clock': '🌍',
  'timestamp-converter': '🔄',
  'age-calculator': '🎂',
  'pomodoro-timer': '🍅',
  // 计算工具
  calculator: '🧮',
  salary: '💰',
  bmi: '⚖️',
  mortgage: '🏠',
  'unit-converter': '📐',
  'tax-calculator': '📊',
  // 文本工具
  encrypt: '🔐',
  qrcode: '📱',
  'json-formatter': '{ }',
  'word-counter': '📝',
  'regex-tester': '🔍',
  // 图像工具
  compress: '🗜️',
  'color-tool': '🎨',
  'color-picker': '🖼️',
  // 生活工具
  'lucky-wheel': '🎯',
  // 页面
  index: '🏠',
  favorites: '⭐',
  mine: '👤',
  settings: '⚙️',
  about: '💡',
  profile: '👤',
}

// 绘制圆角矩形 (Canvas 2D API)
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

/**
 * 使用 Canvas 绘制工具类别图标
 */
function drawCategoryIcon(
  ctx: CanvasRenderingContext2D,
  category: string,
  x: number,
  y: number,
  size: number = 36
) {
  ctx.strokeStyle = '#FFFFFF'
  ctx.fillStyle = '#FFFFFF'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const halfSize = size / 2

  switch (category) {
    case 'time':
      // 绘制时钟
      ctx.beginPath()
      ctx.arc(x, y, halfSize, 0, Math.PI * 2)
      ctx.stroke()

      // 时针
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - halfSize * 0.5)
      ctx.stroke()

      // 分针
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + halfSize * 0.65, y)
      ctx.stroke()

      // 中心点
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'calc':
      // 绘制计算器符号（简化的加减乘除）
      const offset = halfSize * 0.6

      // 加号（横）
      ctx.beginPath()
      ctx.moveTo(x - offset * 0.6, y - offset)
      ctx.lineTo(x + offset * 0.6, y - offset)
      ctx.stroke()

      // 加号（竖）
      ctx.beginPath()
      ctx.moveTo(x, y - offset - offset * 0.6)
      ctx.lineTo(x, y - offset + offset * 0.6)
      ctx.stroke()

      // 减号
      ctx.beginPath()
      ctx.moveTo(x - offset * 0.6, y)
      ctx.lineTo(x + offset * 0.6, y)
      ctx.stroke()

      // 等号
      ctx.beginPath()
      ctx.moveTo(x - offset * 0.6, y + offset - 3)
      ctx.lineTo(x + offset * 0.6, y + offset - 3)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x - offset * 0.6, y + offset + 3)
      ctx.lineTo(x + offset * 0.6, y + offset + 3)
      ctx.stroke()
      break

    case 'text':
      // 绘制文档图标
      const docWidth = size * 0.7
      const docHeight = size * 0.9
      const docX = x - docWidth / 2
      const docY = y - docHeight / 2
      const foldSize = docWidth * 0.25

      // 文档主体
      ctx.beginPath()
      ctx.moveTo(docX, docY)
      ctx.lineTo(docX + docWidth - foldSize, docY)
      ctx.lineTo(docX + docWidth, docY + foldSize)
      ctx.lineTo(docX + docWidth, docY + docHeight)
      ctx.lineTo(docX, docY + docHeight)
      ctx.closePath()
      ctx.stroke()

      // 折角
      ctx.beginPath()
      ctx.moveTo(docX + docWidth - foldSize, docY)
      ctx.lineTo(docX + docWidth - foldSize, docY + foldSize)
      ctx.lineTo(docX + docWidth, docY + foldSize)
      ctx.stroke()

      // 文字线条
      const lineY1 = docY + docHeight * 0.35
      const lineY2 = docY + docHeight * 0.55
      const lineY3 = docY + docHeight * 0.75
      const lineMargin = docWidth * 0.2

      ctx.beginPath()
      ctx.moveTo(docX + lineMargin, lineY1)
      ctx.lineTo(docX + docWidth - lineMargin, lineY1)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(docX + lineMargin, lineY2)
      ctx.lineTo(docX + docWidth - lineMargin, lineY2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(docX + lineMargin, lineY3)
      ctx.lineTo(docX + docWidth - lineMargin * 2, lineY3)
      ctx.stroke()
      break

    case 'image':
      // 绘制图片框架
      const imgSize = size * 0.8
      const imgX = x - imgSize / 2
      const imgY = y - imgSize / 2

      // 外框
      ctx.strokeRect(imgX, imgY, imgSize, imgSize)

      // 山峰
      ctx.beginPath()
      ctx.moveTo(imgX, imgY + imgSize)
      ctx.lineTo(imgX + imgSize * 0.35, imgY + imgSize * 0.5)
      ctx.lineTo(imgX + imgSize * 0.65, imgY + imgSize * 0.7)
      ctx.lineTo(imgX + imgSize, imgY + imgSize * 0.35)
      ctx.lineTo(imgX + imgSize, imgY + imgSize)
      ctx.closePath()
      ctx.stroke()

      // 太阳
      ctx.beginPath()
      ctx.arc(imgX + imgSize * 0.75, imgY + imgSize * 0.25, imgSize * 0.12, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'life':
      // 绘制目标（同心圆）
      ctx.beginPath()
      ctx.arc(x, y, halfSize, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, halfSize * 0.65, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, halfSize * 0.3, 0, Math.PI * 2)
      ctx.stroke()

      // 中心点
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
      break

    default:
      // 默认：绘制工具图标（扳手简化版）
      ctx.beginPath()
      ctx.arc(x, y, halfSize * 0.9, 0, Math.PI * 2)
      ctx.stroke()

      // 十字
      ctx.beginPath()
      ctx.moveTo(x, y - halfSize * 0.5)
      ctx.lineTo(x, y + halfSize * 0.5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x - halfSize * 0.5, y)
      ctx.lineTo(x + halfSize * 0.5, y)
      ctx.stroke()
      break
  }
}

// 十六进制颜色转 RGBA
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 获取 Canvas 2D 上下文
 * @param canvasId Canvas 的 id
 * @param componentInstance 组件实例（在组件内使用时必须传入）
 */
function getCanvas2DContext(canvasId: string, componentInstance?: any): Promise<{
  canvas: any
  ctx: CanvasRenderingContext2D
  dpr: number
}> {
  return new Promise((resolve, reject) => {
    let query = uni.createSelectorQuery()

    // 如果在组件内使用，需要指定组件实例
    if (componentInstance) {
      query = query.in(componentInstance)
    }

    query
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          console.error(`[shareCanvas] 获取 Canvas 节点失败: ${canvasId}`, res)
          reject(new Error(`Canvas 节点不存在: ${canvasId}`))
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = uni.getSystemInfoSync().pixelRatio || 2

        console.log(`[shareCanvas] 获取 Canvas 成功: ${canvasId}, dpr: ${dpr}`)
        resolve({ canvas, ctx, dpr })
      })
  })
}

/**
 * 生成工具分享图 (Canvas 2D API)
 * @param canvasId Canvas 的 id
 * @param config 分享图配置
 * @param width 宽度
 * @param height 高度
 * @param componentInstance 组件实例（在组件内使用时必须传入）
 */
export async function generateToolShareImage(
  canvasId: string,
  config: ToolShareImageConfig,
  width: number = 600,
  height: number = 480,
  componentInstance?: any
): Promise<string> {
  console.log(`[shareCanvas] 开始生成工具分享图: ${config.toolName}, canvasId: ${canvasId}`)

  try {
    const { canvas, ctx, dpr } = await getCanvas2DContext(canvasId, componentInstance)

    // 设置 Canvas 尺寸（考虑 dpr）
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 获取主题色
    const categoryKey = config.category || 'default'
    const theme = THEME_COLORS[categoryKey] || THEME_COLORS.default
    const primaryColor = config.primaryColor || theme.primary
    const secondaryColor = config.secondaryColor || theme.secondary

    // ===== 背景 =====
    const bgGradient = ctx.createLinearGradient(0, 0, width, height)
    bgGradient.addColorStop(0, primaryColor)
    bgGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // 装饰圆圈
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(-50, -50, 200, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(width + 80, height + 80, 250, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(width - 100, 50, 80, 0, Math.PI * 2)
    ctx.fill()

    // ===== 主卡片 =====
    const cardX = 40
    const cardY = 40
    const cardWidth = width - 80
    const cardHeight = height - 80

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    drawRoundRect(ctx, cardX, cardY, cardWidth, cardHeight, 24)
    ctx.fill()

    const centerX = width / 2

    // ===== 图标区域 =====
    // 图标背景圆
    const iconBgGradient = ctx.createLinearGradient(centerX - 50, 80, centerX + 50, 180)
    iconBgGradient.addColorStop(0, primaryColor)
    iconBgGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = iconBgGradient
    ctx.beginPath()
    ctx.arc(centerX, 130, 50, 0, Math.PI * 2)
    ctx.fill()

    // 绘制图标（使用 Canvas 路径绘制，不使用 emoji）
    drawCategoryIcon(ctx, categoryKey, centerX, 130, 36)

    // ===== 工具名称 =====
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(config.toolName || '实用工具', centerX, 220)

    // ===== 副标题/描述 =====
    if (config.subtitle) {
      ctx.fillStyle = '#666666'
      ctx.font = '16px sans-serif'
      ctx.fillText(config.subtitle, centerX, 260)
    }

    // ===== 分隔线 =====
    const lineGradient = ctx.createLinearGradient(centerX - 100, 290, centerX + 100, 290)
    lineGradient.addColorStop(0, 'rgba(0,0,0,0)')
    lineGradient.addColorStop(0.2, hexToRgba(primaryColor, 0.3))
    lineGradient.addColorStop(0.8, hexToRgba(secondaryColor, 0.3))
    lineGradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.strokeStyle = lineGradient
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX - 100, 290)
    ctx.lineTo(centerX + 100, 290)
    ctx.stroke()

    // ===== Logo 区域 =====
    const logoGradient = ctx.createLinearGradient(centerX - 60, 330, centerX + 60, 330)
    logoGradient.addColorStop(0, primaryColor)
    logoGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = logoGradient
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('EH TOOLS', centerX, 340)

    ctx.fillStyle = '#999999'
    ctx.font = '14px sans-serif'
    ctx.fillText('实用工具集合', centerX, 375)

    // ===== 底部装饰 =====
    const bottomGradient = ctx.createLinearGradient(cardX, cardY + cardHeight - 6, cardX + cardWidth, cardY + cardHeight - 6)
    bottomGradient.addColorStop(0, primaryColor)
    bottomGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = bottomGradient
    drawRoundRect(ctx, cardX, cardY + cardHeight - 6, cardWidth, 6, 3)
    ctx.fill()

    console.log(`[shareCanvas] 绘制完成，开始导出: ${config.toolName}`)

    // 导出为临时文件
    return new Promise((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvas,
        width,
        height,
        destWidth: width * 2,
        destHeight: height * 2,
        fileType: 'png',
        quality: 1,
        success: (res) => {
          console.log(`[shareCanvas] 导出成功: ${config.toolName}`, res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          console.error(`[shareCanvas] 导出失败: ${config.toolName}`, err)
          reject(err)
        },
      })
    })
  } catch (error) {
    console.error(`[shareCanvas] 生成失败: ${config.toolName}`, error)
    throw error
  }
}

/**
 * 生成结果分享图（适用于 BMI、计算结果等）(Canvas 2D API)
 * @param canvasId Canvas 的 id
 * @param config 分享图配置
 * @param width 宽度
 * @param height 高度
 * @param componentInstance 组件实例（在组件内使用时必须传入）
 */
export async function generateResultShareImage(
  canvasId: string,
  config: ResultShareConfig,
  width: number = 600,
  height: number = 720,
  componentInstance?: any
): Promise<string> {
  console.log(`[shareCanvas] 开始生成结果分享图: ${config.title}, canvasId: ${canvasId}`)

  try {
    const { canvas, ctx, dpr } = await getCanvas2DContext(canvasId, componentInstance)

    // 设置 Canvas 尺寸
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // 主题色
    const primaryColor = config.statusColor || '#667eea'
    const secondaryColor = '#764ba2'

    // ===== 背景 =====
    const bgGradient = ctx.createLinearGradient(0, 0, width, height)
    bgGradient.addColorStop(0, primaryColor)
    bgGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // 装饰圆圈
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.beginPath()
    ctx.arc(-80, -80, 250, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(width + 100, height + 100, 300, 0, Math.PI * 2)
    ctx.fill()

    // ===== 主卡片 =====
    const cardX = 40
    const cardY = 40
    const cardWidth = width - 80
    const cardHeight = height - 80

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    drawRoundRect(ctx, cardX, cardY, cardWidth, cardHeight, 24)
    ctx.fill()

    const centerX = width / 2

    // ===== 顶部标题 =====
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.title, centerX, 100)

    // ===== 结果展示区 =====
    const resultBgGradient = ctx.createLinearGradient(70, 140, 70, 360)
    resultBgGradient.addColorStop(0, hexToRgba(primaryColor, 0.08))
    resultBgGradient.addColorStop(1, hexToRgba(primaryColor, 0.02))
    ctx.fillStyle = resultBgGradient
    drawRoundRect(ctx, 70, 140, cardWidth - 60, 240, 20)
    ctx.fill()

    // 结果标签
    ctx.fillStyle = '#666666'
    ctx.font = '16px sans-serif'
    ctx.fillText(config.resultLabel, centerX, 180)

    // 主结果值
    ctx.fillStyle = primaryColor
    ctx.font = 'bold 72px sans-serif'
    const resultText = config.resultUnit
      ? `${config.resultValue} ${config.resultUnit}`
      : config.resultValue
    ctx.fillText(resultText, centerX, 260)

    // 状态文字
    if (config.statusText) {
      const statusWidth = config.statusText.length * 20 + 40
      const statusGradient = ctx.createLinearGradient(centerX - statusWidth/2, 310, centerX + statusWidth/2, 310)
      statusGradient.addColorStop(0, primaryColor)
      statusGradient.addColorStop(1, secondaryColor)
      ctx.fillStyle = statusGradient
      drawRoundRect(ctx, centerX - statusWidth/2, 300, statusWidth, 36, 18)
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '18px sans-serif'
      ctx.fillText(config.statusText, centerX, 318)
    }

    // ===== 副结果 =====
    if (config.subResults && config.subResults.length > 0) {
      const subY = 430
      const subItemWidth = (cardWidth - 60) / config.subResults.length

      config.subResults.forEach((item, index) => {
        const itemX = 70 + subItemWidth * index + subItemWidth / 2

        ctx.fillStyle = '#999999'
        ctx.font = '14px sans-serif'
        ctx.fillText(item.label, itemX, subY)

        ctx.fillStyle = '#333333'
        ctx.font = 'bold 20px sans-serif'
        ctx.fillText(item.value, itemX, subY + 35)
      })
    }

    // ===== 分隔线 =====
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(100, 510)
    ctx.lineTo(width - 100, 510)
    ctx.stroke()

    // ===== Logo 区域 =====
    const logoGradient = ctx.createLinearGradient(centerX - 60, 550, centerX + 60, 550)
    logoGradient.addColorStop(0, primaryColor)
    logoGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = logoGradient
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('EH TOOLS', centerX, 555)

    ctx.fillStyle = '#999999'
    ctx.font = '14px sans-serif'
    ctx.fillText('实用工具集合', centerX, 590)

    // ===== 底部装饰 =====
    const bottomGradient = ctx.createLinearGradient(cardX, cardY + cardHeight - 6, cardX + cardWidth, cardY + cardHeight - 6)
    bottomGradient.addColorStop(0, primaryColor)
    bottomGradient.addColorStop(1, secondaryColor)
    ctx.fillStyle = bottomGradient
    drawRoundRect(ctx, cardX, cardY + cardHeight - 6, cardWidth, 6, 3)
    ctx.fill()

    console.log(`[shareCanvas] 结果分享图绘制完成: ${config.title}`)

    // 导出为临时文件
    return new Promise((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvas,
        width,
        height,
        destWidth: width * 2,
        destHeight: height * 2,
        fileType: 'png',
        quality: 1,
        success: (res) => {
          console.log('[shareCanvas] 结果分享图导出成功:', res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          console.error('[shareCanvas] 结果分享图导出失败:', err)
          reject(err)
        },
      })
    })
  } catch (error) {
    console.error(`[shareCanvas] 结果分享图生成失败: ${config.title}`, error)
    throw error
  }
}

/**
 * 生成首页分享图（简洁版）
 */
export async function generateHomeShareImage(
  canvasId: string,
  width: number = 600,
  height: number = 480,
  componentInstance?: any
): Promise<string> {
  console.log('[shareCanvas] 开始生成首页分享图')

  try {
    const { canvas, ctx, dpr } = await getCanvas2DContext(canvasId, componentInstance)

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const centerX = width / 2

    // 品牌色
    const brandPrimary = '#667eea'
    const brandSecondary = '#764ba2'

    // ===== 纯白背景 =====
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // ===== 顶部渐变条 =====
    const topGradient = ctx.createLinearGradient(0, 0, width, 0)
    topGradient.addColorStop(0, brandPrimary)
    topGradient.addColorStop(1, brandSecondary)
    ctx.fillStyle = topGradient
    ctx.fillRect(0, 0, width, 8)

    // ===== 图标 =====
    const iconY = 120

    // 图标背景圆
    const iconBgGradient = ctx.createLinearGradient(centerX - 55, iconY - 55, centerX + 55, iconY + 55)
    iconBgGradient.addColorStop(0, brandPrimary)
    iconBgGradient.addColorStop(1, brandSecondary)
    ctx.fillStyle = iconBgGradient
    ctx.beginPath()
    ctx.arc(centerX, iconY, 55, 0, Math.PI * 2)
    ctx.fill()

    // 字母 logo "EH"
    ctx.font = 'bold 42px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('EH', centerX, iconY)

    // ===== 标题 =====
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText('EH Tools', centerX, 220)

    // ===== 副标题 =====
    ctx.fillStyle = '#666666'
    ctx.font = '18px sans-serif'
    ctx.fillText('实用工具集合', centerX, 260)

    // ===== 分隔线 =====
    ctx.strokeStyle = '#eeeeee'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(100, 300)
    ctx.lineTo(width - 100, 300)
    ctx.stroke()

    // ===== 特性标签 =====
    const tagY = 350
    const tags = ['便捷', '高效', '免费']
    const tagWidth = 80
    const tagGap = 30
    const totalW = tags.length * tagWidth + (tags.length - 1) * tagGap
    const startX = centerX - totalW / 2

    tags.forEach((tag, i) => {
      const x = startX + i * (tagWidth + tagGap) + tagWidth / 2

      // 标签背景
      ctx.fillStyle = hexToRgba(brandPrimary, 0.1)
      drawRoundRect(ctx, x - tagWidth / 2, tagY - 16, tagWidth, 32, 16)
      ctx.fill()

      // 标签文字
      ctx.fillStyle = brandPrimary
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(tag, x, tagY)
    })

    // ===== 底部提示 =====
    ctx.fillStyle = '#999999'
    ctx.font = '12px sans-serif'
    ctx.fillText('点击立即体验', centerX, height - 40)

    // ===== 底部渐变条 =====
    const bottomGradient = ctx.createLinearGradient(0, height - 6, width, height - 6)
    bottomGradient.addColorStop(0, brandPrimary)
    bottomGradient.addColorStop(1, brandSecondary)
    ctx.fillStyle = bottomGradient
    ctx.fillRect(0, height - 6, width, 6)

    console.log('[shareCanvas] 首页分享图绘制完成')

    // 导出为临时文件
    return new Promise((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvas,
        width,
        height,
        destWidth: width * 2,
        destHeight: height * 2,
        fileType: 'png',
        quality: 1,
        success: (res) => {
          console.log('[shareCanvas] 首页分享图导出成功:', res.tempFilePath)
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          console.error('[shareCanvas] 首页分享图导出失败:', err)
          reject(err)
        },
      })
    })
  } catch (error) {
    console.error('[shareCanvas] 首页分享图生成失败:', error)
    throw error
  }
}

// 兼容旧版 API
export async function generateShareImage(
  canvasId: string,
  toolName?: string,
  width: number = 600,
  height: number = 480
): Promise<string> {
  return generateToolShareImage(canvasId, {
    toolName: toolName || 'EH Tools',
    subtitle: toolName ? undefined : '实用工具集合',
  }, width, height)
}

export default {
  generateShareImage,
  generateToolShareImage,
  generateResultShareImage,
  generateHomeShareImage,
  THEME_COLORS,
  TOOL_ICONS,
}
