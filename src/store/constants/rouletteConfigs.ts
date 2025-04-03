import {RouletteConfig} from "@/store/slices/rouletteSlice";

export const yesOrNo: RouletteConfig = {
  id: "0",
  name: "是或否?",
  items: [
    {id: "1", name: "是", color: "#FF6F00"},
    {id: "2", name: "否", color: "#FF0000"},
  ],
  createTime: Date.now(),
  description: "Yes or No, this is a question"
}
export const twelveStars: RouletteConfig = {
  id: "stars",
  name: "十二星座",
  items: [
    {id: "1", name: "白羊座"},
    {id: "2", name: "金牛座"},
    {id: "3", name: "双子座"},
    {id: "4", name: "巨蟹座"},
    {id: "5", name: "狮子座"},
    {id: "6", name: "处女座"},
    {id: "7", name: "天秤座"},
    {id: "8", name: "天蝎座"},
    {id: "9", name: "射手座"},
    {id: "10", name: "摩羯座"},
    {id: "11", name: "水瓶座"},
    {id: "12", name: "双鱼座"},
  ],
  createTime: Date.now(),
  description: "选择你的星座"
}
export const gua8: RouletteConfig = {
  id: "bagua",
  name: "八卦",
  items: [
    {id: "1", name: "乾"},
    {id: "2", name: "坤"},
    {id: "3", name: "震"},
    {id: "4", name: "巽"},
    {id: "5", name: "坎"},
    {id: "6", name: "离"},
    {id: "7", name: "艮"},
    {id: "8", name: "坎"},
  ],
  createTime: Date.now(),
  description: "八卦"
}
export const gua64: RouletteConfig = {
  id: "gua",
  name: "六十四卦",
  items: [
    {id: "1", name: "乾", color: "#FFD700"},   // 天行健 - 金色象征天
    {id: "2", name: "坤", color: "#8B4513"},   // 地势坤 - 大地棕
    {id: "3", name: "屯", color: "#87CEEB"},   // 水雷屯 - 水蓝色
    {id: "4", name: "蒙", color: "#6B8E23"},   // 山水蒙 - 山林绿
    {id: "5", name: "需", color: "#FFA07A"},   // 水天需 - 火色与水结合
    {id: "6", name: "讼", color: "#B0C4DE"},   // 天水讼 - 冷色调争议
    {id: "7", name: "师", color: "#808080"},   // 地水师 - 军事灰
    {id: "8", name: "比", color: "#6495ED"},   // 水地比 - 合作蓝
    {id: "9", name: "小畜", color: "#98FB98"}, // 风天小畜 - 嫩绿生长
    {id: "10", name: "履", color: "#D2691E"},   // 天泽履 - 金属铜色
    {id: "11", name: "泰", color: "#32CD32"},   // 地天泰 - 和谐绿
    {id: "12", name: "否", color: "#696969"},   // 天地否 - 闭塞灰
    {id: "13", name: "同人", color: "#FF6347"}, // 天火同人 - 热情红
    {id: "14", name: "大有", color: "#FFD700"}, // 火天大有 - 丰收金
    {id: "15", name: "谦", color: "#D2B48C"},   // 地山谦 - 土黄色
    {id: "16", name: "豫", color: "#9ACD32"},   // 雷地豫 - 春雷绿
    {id: "17", name: "随", color: "#BA55D3"},   // 泽雷随 - 变革紫
    {id: "18", name: "蛊", color: "#A0522D"},   // 山风蛊 - 腐败褐
    {id: "19", name: "临", color: "#66CDAA"},   // 地泽临 - 管理青
    {id: "20", name: "观", color: "#4682B4"},   // 风地观 - 观察蓝
    {id: "21", name: "噬嗑", color: "#DC143C"}, // 火雷噬嗑 - 激烈红
    {id: "22", name: "贲", color: "#FF69B4"},   // 山火贲 - 装饰粉
    {id: "23", name: "剥", color: "#4B0082"},   // 山地剥 - 阴暗紫
    {id: "24", name: "复", color: "#00FF00"},   // 地雷复 - 新生绿
    {id: "25", name: "无妄", color: "#F0E68C"}, // 天雷无妄 - 意外黄
    {id: "26", name: "大畜", color: "#DEB887"}, // 山天大畜 - 积蓄棕
    {id: "27", name: "颐", color: "#7FFF00"},   // 山雷颐 - 养生绿
    {id: "28", name: "大过", color: "#8A2BE2"}, // 泽风大过 - 危机紫
    {id: "29", name: "坎", color: "#0000FF"},    // 坎为水 - 水蓝色
    {id: "30", name: "离", color: "#FF0000"},    // 离为火 - 火红色
    {id: "31", name: "咸", color: "#FFA500"},   // 泽山咸 - 感应橙
    {id: '32', name: "恒", color: "#008080"},    // 雷风恒 - 持久青
    {id: '33', name: "遯", color: "#778899"},    // 天山遯 - 隐退灰
    {id: '34', name: "大壮", color: "#CD5C5C"}, // 雷天大壮 - 强盛红
    {id: '35', name: "晋", color: "#9370DB"},   // 火地晋 - 晋升紫
    {id: '36', name: "明夷", color: "#483D8B"}, // 地火明夷 - 暗夜深蓝
    {id: '37', name: "家人", color: "#FFB6C1"}, // 风火家人 - 温馨粉
    {id: '38', name: "睽", color: "#FF4500"},    // 火泽睽 - 对立橙红
    {id: '39', name: "蹇", color: "#4169E1"},   // 水山蹇 - 困难深蓝
    {id: '40', name: "解", color: "#00FFFF"},   // 雷水解 - 释放青
    {id: '41', name: "损", color: "#8B0000"},   // 山泽损 - 损失暗红
    {id: '42', name: "益", color: "#3CB371"},   // 风雷益 - 增益绿
    {id: '43', name: "夬", color: "#FF1493"},   // 泽天夬 - 决断粉红
    {id: '44', name: "姤", color: "#FF00FF"},   // 天风姤 - 邂逅紫红
    {id: '45', name: "萃", color: "#2E8B57"},   // 泽地萃 - 聚集深绿
    {id: '46', name: "升", color: "#7CFC00"},   // 地风升 - 上升亮绿
    {id: "47", name: "困", color: "#4B0082"},   // 泽水困 - 困境深紫
    {id: '48', name: "井", color: "#00BFFF"},   // 水风井 - 水源天蓝
    {id: '49', name: "革", color: "#FF8C00"},   // 泽火革 - 变革橙
    {id: '50', name: "鼎", color: "#B8860B"},   // 火风鼎 - 青铜色
    {id: '51', name: "震", color: "#006400"},    // 震为雷 - 深绿震动
    {id: "52", name: "艮", color: "#A52A2A"},   // 艮为山 - 山体棕
    {id: "53", name: "渐", color: "#DA70D6"},   // 风山渐 - 渐进紫
    {id: '54', name: "归妹", color: "#C71585"}, // 雷泽归妹 - 婚姻玫红
    {id: '55', name: "丰", color: "#FFD700"},   // 雷火丰 - 丰收金
    {id: "56", name: "旅", color: "#DAA520"},   // 火山旅 - 旅行金棕
    {id: '57', name: "巽", color: "#00FF7F"},   // 巽为风 - 风动亮绿
    {id: '58', name: "兑", color: "#FF69B4"},   // 兑为泽 - 悦动粉
    {id: '59', name: "涣", color: "#87CEFA"},   // 风水涣 - 散漫天蓝
    {id: "60", name: "节", color: "#6A5ACD"},   // 水泽节 - 节制靛蓝
    {id: "61", name: "中孚", color: "#48D1CC"}, // 风泽中孚 - 诚信青
    {id: "62", name: "小过", color: "#708090"}, // 雷山小过 - 小错灰
    {id: "63", name: "既济", color: "#7B68EE"}, // 水火既济 - 完成紫
    {id: "64", name: "未济", color: "#FF1493"}  // 火水未济 - 未成玫红
  ],
  createTime: Date.now(),
  description: "周易六十四卦"
}
export const eatToday: RouletteConfig = {
  id: "1",
  name: "今天吃什么?",
  items: [
    {id: "1", name: "寿司", color: "#FF6B6B"},     // 日式料理-三文鱼粉
    {id: "2", name: "披萨", color: "#FFA726"},    // 烤箱烘焙-芝士橙
    {id: "3", name: "麻辣烫", color: "#D32F2F"},  // 辛辣红色系
    {id: "4", name: "沙拉", color: "#81C784"},    // 蔬菜绿
    {id: "5", name: "关东煮", color: "#8D6E63"},  // 汤底暖棕
    {id: "6", name: "蛋挞", color: "#FFF176"},    // 蛋奶金黄
    {id: "7", name: "慕斯蛋糕", color: "#E1BEE7"},// 甜品淡紫
    {id: "8", name: "鳗鱼饭", color: "#795548"},  // 酱汁深棕
    {id: "9", name: "椰子鸡", color: "#FFF3E0"},  // 椰奶米白
    {id: "10", name: "冬阴功", color: "#FF7043"}, // 泰式酸辣橙
    {id: "11", name: "提拉米苏", color: "#6D4C41"},// 咖啡可可色
    {id: "12", name: "螺蛳粉", color: "#A1887F"}, // 酸笋大地色
    {id: "13", name: "班尼迪克蛋", color: "#FFECB3"}, // 荷兰酱浅黄
    {id: "14", name: "惠灵顿牛排", color: "#BCAAA4"},// 酥皮浅棕
    {id: "15", name: "杨枝甘露", color: "#FFCC80"}  // 芒果西柚橙黄
  ],
  createTime: Date.now(),
  description: "选择困难症者的福音"
}
export const languageSelect: RouletteConfig = {
  id: "2",
  name: "选择什么语言?",
  items: [
    {id: "1", name: "C++"},
    {id: "2", name: "C#"},
    {id: "3", name: "JAVA"},
    {id: "4", name: "PHP"},
    {id: "5", name: "JavaScript"},
    {id: "6", name: "TypeScript"},
    {id: "7", name: "python"},
    {id: "8", name: "Go"},
  ],
  createTime: Date.now(),
  description: "你就学吧!"
}

export const RouletteConfigs = [yesOrNo, gua8, gua64, twelveStars, eatToday, languageSelect]
