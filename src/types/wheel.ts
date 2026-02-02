/**
 * 类型定义 - 转盘
 */

export interface WheelItem {
  id: string
  name: string
  color: string
  probability: number
}

export interface WheelConfig {
  id: string
  name: string
  description: string
  items: WheelItem[]
  createdAt: number
  updatedAt: number
}

export interface WheelHistory {
  id: string
  configId: string
  configName: string
  itemName: string
  timestamp: number
}

// 预设配置
export const PRESET_CONFIGS: WheelConfig[] = [
  {
    id: 'preset-yes-no',
    name: '是或否',
    description: '简单的二选一',
    items: [
      { id: '1', name: '是', color: '#52C41A', probability: 50 },
      { id: '2', name: '否', color: '#FF4D4F', probability: 50 }
    ],
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'preset-zodiac',
    name: '十二星座',
    description: '随机选择星座',
    items: [
      { id: '1', name: '白羊座', color: '#FF6B6B', probability: 8.33 },
      { id: '2', name: '金牛座', color: '#4ECDC4', probability: 8.33 },
      { id: '3', name: '双子座', color: '#FFE66D', probability: 8.33 },
      { id: '4', name: '巨蟹座', color: '#95E1D3', probability: 8.33 },
      { id: '5', name: '狮子座', color: '#F38181', probability: 8.33 },
      { id: '6', name: '处女座', color: '#AA96DA', probability: 8.33 },
      { id: '7', name: '天秤座', color: '#FCBAD3', probability: 8.33 },
      { id: '8', name: '天蝎座', color: '#A8D8EA', probability: 8.33 },
      { id: '9', name: '射手座', color: '#FF9F43', probability: 8.33 },
      { id: '10', name: '摩羯座', color: '#6A89CC', probability: 8.33 },
      { id: '11', name: '水瓶座', color: '#82CCDD', probability: 8.33 },
      { id: '12', name: '双鱼座', color: '#B8E994', probability: 8.37 }
    ],
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'preset-bagua',
    name: '传统八卦',
    description: '八卦占卜',
    items: [
      { id: '1', name: '乾', color: '#FFD700', probability: 12.5 },
      { id: '2', name: '坤', color: '#8B4513', probability: 12.5 },
      { id: '3', name: '震', color: '#228B22', probability: 12.5 },
      { id: '4', name: '巽', color: '#00CED1', probability: 12.5 },
      { id: '5', name: '坎', color: '#4169E1', probability: 12.5 },
      { id: '6', name: '离', color: '#FF4500', probability: 12.5 },
      { id: '7', name: '艮', color: '#A0522D', probability: 12.5 },
      { id: '8', name: '兑', color: '#87CEEB', probability: 12.5 }
    ],
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'preset-food',
    name: '今天吃什么',
    description: '解决选择困难症',
    items: [
      { id: '1', name: '火锅', color: '#FF6B6B', probability: 6.67 },
      { id: '2', name: '烧烤', color: '#FF8C42', probability: 6.67 },
      { id: '3', name: '麻辣烫', color: '#FF5252', probability: 6.67 },
      { id: '4', name: '炒菜', color: '#4CAF50', probability: 6.67 },
      { id: '5', name: '面条', color: '#FFD54F', probability: 6.67 },
      { id: '6', name: '饺子', color: '#FFECB3', probability: 6.67 },
      { id: '7', name: '汉堡', color: '#FFA726', probability: 6.67 },
      { id: '8', name: '披萨', color: '#EF5350', probability: 6.67 },
      { id: '9', name: '寿司', color: '#26A69A', probability: 6.67 },
      { id: '10', name: '炸鸡', color: '#FFAB40', probability: 6.67 },
      { id: '11', name: '沙拉', color: '#66BB6A', probability: 6.67 },
      { id: '12', name: '粥', color: '#EEEEEE', probability: 6.67 },
      { id: '13', name: '盖浇饭', color: '#8D6E63', probability: 6.67 },
      { id: '14', name: '螺蛳粉', color: '#FF7043', probability: 6.67 },
      { id: '15', name: '黄焖鸡', color: '#FFC107', probability: 6.65 }
    ],
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'preset-language',
    name: '选择什么语言',
    description: '编程语言随机选择',
    items: [
      { id: '1', name: 'JavaScript', color: '#F7DF1E', probability: 12.5 },
      { id: '2', name: 'TypeScript', color: '#3178C6', probability: 12.5 },
      { id: '3', name: 'Python', color: '#3776AB', probability: 12.5 },
      { id: '4', name: 'Java', color: '#ED8B00', probability: 12.5 },
      { id: '5', name: 'Go', color: '#00ADD8', probability: 12.5 },
      { id: '6', name: 'Rust', color: '#DEA584', probability: 12.5 },
      { id: '7', name: 'C++', color: '#00599C', probability: 12.5 },
      { id: '8', name: 'Swift', color: '#FA7343', probability: 12.5 }
    ],
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: 'preset-64gua',
    name: '周易六十四卦',
    description: '六十四卦占卜',
    items: [
      { id: '1', name: '乾', color: '#FFD700', probability: 1.5625 },
      { id: '2', name: '坤', color: '#8B4513', probability: 1.5625 },
      { id: '3', name: '屯', color: '#228B22', probability: 1.5625 },
      { id: '4', name: '蒙', color: '#4682B4', probability: 1.5625 },
      { id: '5', name: '需', color: '#00CED1', probability: 1.5625 },
      { id: '6', name: '讼', color: '#DC143C', probability: 1.5625 },
      { id: '7', name: '师', color: '#2F4F4F', probability: 1.5625 },
      { id: '8', name: '比', color: '#9370DB', probability: 1.5625 },
      { id: '9', name: '小畜', color: '#32CD32', probability: 1.5625 },
      { id: '10', name: '履', color: '#FF8C00', probability: 1.5625 },
      { id: '11', name: '泰', color: '#4169E1', probability: 1.5625 },
      { id: '12', name: '否', color: '#696969', probability: 1.5625 },
      { id: '13', name: '同人', color: '#FF6347', probability: 1.5625 },
      { id: '14', name: '大有', color: '#DAA520', probability: 1.5625 },
      { id: '15', name: '谦', color: '#708090', probability: 1.5625 },
      { id: '16', name: '豫', color: '#9ACD32', probability: 1.5625 },
      { id: '17', name: '随', color: '#20B2AA', probability: 1.5625 },
      { id: '18', name: '蛊', color: '#8B0000', probability: 1.5625 },
      { id: '19', name: '临', color: '#00FA9A', probability: 1.5625 },
      { id: '20', name: '观', color: '#1E90FF', probability: 1.5625 },
      { id: '21', name: '噬嗑', color: '#FF4500', probability: 1.5625 },
      { id: '22', name: '贲', color: '#FF69B4', probability: 1.5625 },
      { id: '23', name: '剥', color: '#A52A2A', probability: 1.5625 },
      { id: '24', name: '复', color: '#7CFC00', probability: 1.5625 },
      { id: '25', name: '无妄', color: '#87CEEB', probability: 1.5625 },
      { id: '26', name: '大畜', color: '#B8860B', probability: 1.5625 },
      { id: '27', name: '颐', color: '#98FB98', probability: 1.5625 },
      { id: '28', name: '大过', color: '#FF1493', probability: 1.5625 },
      { id: '29', name: '坎', color: '#000080', probability: 1.5625 },
      { id: '30', name: '离', color: '#FF0000', probability: 1.5625 },
      { id: '31', name: '咸', color: '#DDA0DD', probability: 1.5625 },
      { id: '32', name: '恒', color: '#2E8B57', probability: 1.5625 },
      { id: '33', name: '遁', color: '#778899', probability: 1.5625 },
      { id: '34', name: '大壮', color: '#CD853F', probability: 1.5625 },
      { id: '35', name: '晋', color: '#FFA500', probability: 1.5625 },
      { id: '36', name: '明夷', color: '#191970', probability: 1.5625 },
      { id: '37', name: '家人', color: '#F0E68C', probability: 1.5625 },
      { id: '38', name: '睽', color: '#E9967A', probability: 1.5625 },
      { id: '39', name: '蹇', color: '#5F9EA0', probability: 1.5625 },
      { id: '40', name: '解', color: '#66CDAA', probability: 1.5625 },
      { id: '41', name: '损', color: '#BA55D3', probability: 1.5625 },
      { id: '42', name: '益', color: '#00FF7F', probability: 1.5625 },
      { id: '43', name: '夬', color: '#FFD700', probability: 1.5625 },
      { id: '44', name: '姤', color: '#DB7093', probability: 1.5625 },
      { id: '45', name: '萃', color: '#3CB371', probability: 1.5625 },
      { id: '46', name: '升', color: '#7B68EE', probability: 1.5625 },
      { id: '47', name: '困', color: '#483D8B', probability: 1.5625 },
      { id: '48', name: '井', color: '#00BFFF', probability: 1.5625 },
      { id: '49', name: '革', color: '#DC143C', probability: 1.5625 },
      { id: '50', name: '鼎', color: '#B22222', probability: 1.5625 },
      { id: '51', name: '震', color: '#8B008B', probability: 1.5625 },
      { id: '52', name: '艮', color: '#A0522D', probability: 1.5625 },
      { id: '53', name: '渐', color: '#6B8E23', probability: 1.5625 },
      { id: '54', name: '归妹', color: '#FF7F50', probability: 1.5625 },
      { id: '55', name: '丰', color: '#FFB6C1', probability: 1.5625 },
      { id: '56', name: '旅', color: '#CD5C5C', probability: 1.5625 },
      { id: '57', name: '巽', color: '#48D1CC', probability: 1.5625 },
      { id: '58', name: '兑', color: '#AFEEEE', probability: 1.5625 },
      { id: '59', name: '涣', color: '#ADD8E6', probability: 1.5625 },
      { id: '60', name: '节', color: '#90EE90', probability: 1.5625 },
      { id: '61', name: '中孚', color: '#F5DEB3', probability: 1.5625 },
      { id: '62', name: '小过', color: '#DEB887', probability: 1.5625 },
      { id: '63', name: '既济', color: '#8FBC8F', probability: 1.5625 },
      { id: '64', name: '未济', color: '#BC8F8F', probability: 1.5625 }
    ],
    createdAt: 0,
    updatedAt: 0
  }
]
