/**
 * 类型定义 - 工具
 */

export interface Tool {
  id: string
  name: string
  nameKey: string  // i18n key
  icon: string     // SVG 图标名称
  path: string
  category: ToolCategory
}

export type ToolCategory = 'time' | 'calc' | 'text' | 'image' | 'life'

export interface ToolCategoryInfo {
  id: ToolCategory
  name: string
  nameKey: string  // i18n key
  icon: string     // 分类图标名称
  tools: Tool[]
}

// 工具配置 - 使用 SVG 图标名称
export const TOOLS: Tool[] = [
  // 时间工具
  { id: 'calendar', name: '万年历', nameKey: 'tool.calendar', icon: 'calendar', path: '/pages/time/calendar/index', category: 'time' },
  { id: 'countdown', name: '倒计时', nameKey: 'tool.countdown', icon: 'timer', path: '/pages/time/countdown/index', category: 'time' },
  { id: 'time-diff', name: '时间差', nameKey: 'tool.timeDiff', icon: 'hourglass', path: '/pages/time/time-diff/index', category: 'time' },
  { id: 'world-clock', name: '世界时钟', nameKey: 'tool.worldClock', icon: 'globe', path: '/pages/time/world-clock/index', category: 'time' },
  { id: 'timestamp-converter', name: '时间戳转换', nameKey: 'tool.timestampConverter', icon: 'timestamp', path: '/pages/time/timestamp-converter/index', category: 'time' },
  { id: 'age-calculator', name: '年龄计算器', nameKey: 'tool.ageCalculator', icon: 'age', path: '/pages/time/age-calculator/index', category: 'time' },
  { id: 'pomodoro-timer', name: '番茄钟', nameKey: 'tool.pomodoroTimer', icon: 'pomodoro', path: '/pages/time/pomodoro-timer/index', category: 'time' },
  { id: 'worker-clock', name: '打工人时钟', nameKey: 'tool.workerClock', icon: 'worker-clock', path: '/pages/time/worker-clock/index', category: 'time' },

  // 计算工具
  { id: 'calculator', name: '计算器', nameKey: 'tool.calculator', icon: 'calculator', path: '/pages/calc/calculator/index', category: 'calc' },
  { id: 'salary', name: '工资计算', nameKey: 'tool.salary', icon: 'money', path: '/pages/calc/salary/index', category: 'calc' },
  { id: 'bmi', name: 'BMI', nameKey: 'tool.bmi', icon: 'scale', path: '/pages/calc/bmi/index', category: 'calc' },
  { id: 'mortgage', name: '房贷计算', nameKey: 'tool.mortgage', icon: 'building', path: '/pages/calc/mortgage/index', category: 'calc' },
  { id: 'unit-converter', name: '单位换算', nameKey: 'tool.unitConverter', icon: 'ruler', path: '/pages/calc/unit-converter/index', category: 'calc' },
  { id: 'tax-calculator', name: '个税计算', nameKey: 'tool.taxCalculator', icon: 'tax-calculator', path: '/pages/calc/tax-calculator/index', category: 'calc' },

  // 文本工具
  { id: 'encrypt', name: '加密解密', nameKey: 'tool.encrypt', icon: 'lock', path: '/pages/text/encrypt/index', category: 'text' },
  { id: 'qrcode', name: '二维码', nameKey: 'tool.qrcode', icon: 'qrcode', path: '/pages/text/qrcode/index', category: 'text' },
  { id: 'json-formatter', name: 'JSON格式化', nameKey: 'tool.jsonFormatter', icon: 'json-format', path: '/pages/text/json-formatter/index', category: 'text' },
  { id: 'word-counter', name: '字数统计', nameKey: 'tool.wordCounter', icon: 'word-counter', path: '/pages/text/word-counter/index', category: 'text' },
  { id: 'regex-tester', name: '正则测试器', nameKey: 'tool.regexTester', icon: 'regex', path: '/pages/text/regex-tester/index', category: 'text' },
  { id: 'led-marquee', name: 'LED字幕', nameKey: 'tool.ledMarquee', icon: 'led-marquee', path: '/pages/text/led-marquee/index', category: 'text' },

  // 图片工具
  { id: 'compress', name: '图片压缩', nameKey: 'tool.compress', icon: 'compress', path: '/pages/image/compress/index', category: 'image' },
  { id: 'color-tool', name: '颜色工具', nameKey: 'tool.colorTool', icon: 'color-card', path: '/pages/image/color-tool/index', category: 'image' },
  { id: 'color-picker', name: '图片取色器', nameKey: 'tool.colorPicker', icon: 'color-picker', path: '/pages/image/color-picker/index', category: 'image' },

  // 生活工具
  { id: 'lucky-wheel', name: '大转盘', nameKey: 'tool.luckyWheel', icon: 'wheel', path: '/pages/life/lucky-wheel/index/index', category: 'life' },
  { id: 'kinship-calculator', name: '亲戚称呼计算器', nameKey: 'tool.kinshipCalculator', icon: 'kinship', path: '/pages/life/kinship-calculator/index', category: 'life' },
  { id: 'license-plate', name: '车牌归属地', nameKey: 'tool.licensePlate', icon: 'license-plate', path: '/pages/life/license-plate/index', category: 'life' },
  { id: 'todo-list', name: '待办清单', nameKey: 'tool.todoList', icon: 'todo-list', path: '/pages/life/todo-list/index', category: 'life' },
  { id: 'size-chart', name: '尺码对照表', nameKey: 'tool.sizeChart', icon: 'size-chart', path: '/pages/life/size-chart/index', category: 'life' }
]

// 分类配置
export const TOOL_CATEGORIES: ToolCategoryInfo[] = [
  { id: 'time', name: '时间工具', nameKey: 'category.time', icon: 'clock', tools: TOOLS.filter(t => t.category === 'time') },
  { id: 'calc', name: '计算工具', nameKey: 'category.calc', icon: 'calculator', tools: TOOLS.filter(t => t.category === 'calc') },
  { id: 'text', name: '文本工具', nameKey: 'category.text', icon: 'lock', tools: TOOLS.filter(t => t.category === 'text') },
  { id: 'image', name: '图片工具', nameKey: 'category.image', icon: 'image', tools: TOOLS.filter(t => t.category === 'image') },
  { id: 'life', name: '生活工具', nameKey: 'category.life', icon: 'target', tools: TOOLS.filter(t => t.category === 'life') }
]
