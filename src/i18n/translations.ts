interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  zh: {
    // common
    delete: "删除",
    start: "开始",
    slotMachine: "抽奖机",
    default: "默认",
    change: "切换",
    ge: "个",
    item: "选项",
    selected: "选中",
    copy: "复制",
    success: "成功",
    failed: "失败",

    // dialog
    confirm: "确定",
    cancel: "取消",
    info: "提示",

    home: '首页',
    adLoading: '广告加载中',
    adError: '广告加载失败',
    adClose: '关闭广告',
    profile: '我的',
    calendar: '万年历',
    pleaseInput: "请输入",
    // roulette
    roulette: '大转盘',
    rouletteCreate: "创建合集",
    rouletteCurrent: "当前合集",
    rouletteConfigList: "合集列表",
    rouletteSetConfig: "配置合集",
    rouletteChoiceHistory: "选择历史",
    rouletteChoiceTip: "命运的抉择是:",
    spinning: "旋转中",
    rouletteEmpty: "请先配置合集",

    rouletteList: '大转盘-列表',
    rouletteListNoItems: '无可用合集,点击创建合集开始创建吧~',
    rouletteListDeleteTip: '删除后无法恢复,确定删除吗?',

    rouletteHistory: '大转盘-历史',
    rouletteHistoryDeleteTip: '确定要删除这条历史记录吗?',
    rouletteHistoryNoItems: '暂无历史记录',

    rouletteConfig: '大转盘-配置',
    rouletteConfigName: '合集名称',
    rouletteConfigDescription: '描述信息',
    rouletteConfigItemName: '选项名称',
    rouletteConfigItemColor: '选项颜色',
    rouletteConfigItemProbability: '指定概率',
    rouletteConfigItemProbabilityPlaceholder: '可选,默认为平均概率',
    updateItem: "更新选项",
    saveConfig: "保存配置",

    about: '关于',
    setting: '设置',
    darkMode: '暗黑模式',
    tools: '工具',
    toolsDescription: '一站式工具集合，集成时间管理、计算工具、图片处理和生活便利等多种实用功能。免费易用，助您提升日常效率，激发创意灵感。',
    language: '语言',
    settingLang: '语言设置',
    settingLangPlaceholder: '请选择语言',
    settingDarkMode: '暗黑模式',
    chinese: '中文',
    english: '英文',
    // login
    notLoggedIn: '未登录',
    login: '登录',
    // About
    appInfo: '应用信息',
    appName: '应用名称',
    appVersion: '版本号',
    appDescription: '应用描述',
    appDescriptionContent: '一个有用的小程序合集,在这里找到你想要的~',
    appAuthor: '开发者',
    appGithub: '项目地址',
    appIssue: '提交反馈',
    appDonate: '赞赏支持',
    appDonateTip: '感谢您的支持！点击图片长按识别赞赏码~',

    // Tool Categories
    timeTools: "时间工具",
    calculatorTools: "计算工具",
    textTools: "文本工具",
    lifeTools: "生活工具",
    artTools: "艺术工具",
    // Time Tools
    countdown: "倒计时器",
    timeDiff: "时间差计算",
    worldClock: "世界时钟",

    // Countdown
    timeSelect: "时间选择",
    pause: "暂停",
    reset: "重置",
    presetTime: "预设时间",
    countdownEnd: "倒计时结束",
    // Time Diff
    startTime: "开始时间",
    endTime: "结束时间",
    timeDifference: "时间差",
    year: "年",
    month: "月",
    week: "周",
    day: "天",
    hour: "小时",
    second: "秒",
    minute: "分钟",
    quickOptions: "快速选项",
    oneWeekAgo: "一周前",
    oneMonthAgo: "一个月前",
    oneYearAgo: "一年前",
    nextWeek: "下周",
    // World Clock
    addTimezone: "添加时区",
    selectTimezone: "选择时区",
    shanghai: "上海",
    newYork: "纽约",
    london: "伦敦",
    tokyo: "东京",
    sydney: "悉尼",
    paris: "巴黎",
    losAngeles: "洛杉矶",
    dubai: "迪拜",
    singapore: "新加坡",
    moscow: "莫斯科",
    // Calculator Tools
    calculator: "计算器",
    clear: "清除",
    rad: "弧度",
    deg: "角度",
    bit: "位",
    and: "与",
    or: "或",
    xor: "异或",
    not: "非",
    shl: "左移",
    shr: "右移",
    laborSalaryCalculator: "劳动法工资计算器",
    dailyWorkTimeExceeded: "日工作时间超过12小时",
    dailyOvertimeExceeded: "日加班时间超过3小时",
    monthlyOvertimeExceeded: "月加班时间超过36小时",
    worthyCalculatorDesc: "计算实际应得工资和加班费",
    baseSalary: "基本工资 (元/月)",
    workHours: "日工作时长 (小时/天)",
    weekendHours: "月休息日加班时长 (小时/月)",
    holidayHours: "月法定节假日加班时长 (小时/月)",
    normalPay: "正常工资",
    workdayOvertimePay: "工作日加班费",
    weekendOvertimePay: "休息日加班费",
    holidayOvertimePay: "节假日加班费",
    totalPay: "应得总工资",
    isLegal: "是否合法",
    violations: "违法情况",
    calculateSalary: "计算实际应得工资",
    legalStatus: "✅ 工资计算符合劳动法规定",
    illegalStatus: "⚠️ 存在违反劳动法情况",
    scientificMode: "科学模式",
    basicMode: "基础模式",
    programmerMode: "程序员模式",
    sqrt: "√",
    mortgage: "房贷计算器",
    unitConverter: "单位换算器",
    bmi: "BMI计算器",
    crypto: "文本转义",
    // Life Tools
    qrcode: "二维码",
    enterText: "输入文本",
    generate: "生成",
    scan: "扫描",
    verify: "验证",
    save: "保存",
    saveSuccess: "保存成功",
    saveFailed: "保存失败",
    scanFromCamera: "相机扫描",
    scanFromAlbum: "相册扫描",
    scanFailed: "扫描失败",
    decodeFailed: "解码失败",
    chooseImageFailed: "选择图片失败",
    copySuccess: "复制成功",
    userCanceled: "用户取消操作",
    cameraPermissionDenied: "没有相机权限",
    // Image Tools
    imageCompressor: "图片压缩",
    imageFilter: "图片滤镜",
    startCompress: "开始压缩",
    addImage: "添加图片",
    chooseImage: "选择图片",
    supportFormat: "支持JPG/PNG格式",
    maxSize: "最大5MB",
    pleaseChooseImage: "请先选择图片",
    compressComplete: "压缩完成",
    compressFailed: "压缩失败",
    pleaseCompressFirst: "请先压缩图片",
    savedToAlbum: "已保存到相册",
    originalImage: "原始图片",
    compressedImage: "压缩后",
    saved: "已保存",
    compressionRatio: "节省",
    bestQuality: "已是最佳质量",
    quality: "质量",
    size: "大小",
    exportImage: "导出图片",
    // Filter
    original: "原图",
    vintage: "复古",
    blackAndWhite: "黑白",
    invert: "反色",
    softLight: "柔光",
    vivid: "鲜艳",
    imageLoaded: "图片已加载",
    imageLoadFailed: "图片选择失败",
    presetFilters: "预设滤镜",
    customAdjust: "自定义调整",
    brightness: "亮度",
    contrast: "对比度",
    saturation: "饱和度",
    hue: "色相",
    blur: "模糊",

    // Mortgage Calculator
    loanAmount: "贷款金额",
    loanAmountUnit: "元",
    loanTerm: "贷款年限",
    loanTermUnit: "年",
    interestRate: "年利率",
    interestRateUnit: "%",
    equalPayment: "等额本息",
    equalPrincipal: "等额本金",
    calculate: "计算",
    monthlyPayment: "首月还款",
    totalPayment: "总还款额",
    totalInterest: "总利息",
    paymentSchedule: "还款计划",
    period: "第",
    periodUnit: "期",
    monthlyPaymentLabel: "月供",
    principalLabel: "本金",
    interestLabel: "利息",
    remainingPrincipal: "剩余本金",
    // BMI Calculator
    height: "身高",
    heightUnit: "cm",
    weight: "体重",
    weightUnit: "kg",
    bmiIndex: "BMI 指数",
    bmiCategory: "体重分类",
    bmiAdvice: "健康建议",
    bmiReference: "BMI 参考标准",
    underweight: "体重过轻",
    underweightAdvice: "建议适当增加营养摄入，保持均衡饮食，适量运动以增强体质。",
    normal: "体重正常",
    normalAdvice: "恭喜！请继续保持健康的生活方式。",
    overweight: "超重",
    overweightAdvice: "建议控制饮食摄入，增加运动量，逐步将体重降至正常范围。",
    obese: "肥胖",
    obeseAdvice: "需要注意控制饮食，规律运动，必要时请咨询医生或营养师。",
    severelyObese: "重度肥胖",
    severelyObeseAdvice: "建议在医生指导下进行减重，注意饮食控制和适量运动。",

    // Unit Converter
    length: "长度",
    area: "面积",
    volume: "体积",
    unitCategory: "单位类别",
    selectUnit: "选择单位",
    selectTargetUnit: "选择转化单位",
    invalidInput: "无效输入",
    kilometer: "千米",
    meter: "米",
    decimeter: "分米",
    centimeter: "厘米",
    millimeter: "毫米",
    mile: "英里",
    yard: "码",
    foot: "英尺",
    inch: "英寸",
    squareKilometer: "平方千米",
    squareMeter: "平方米",
    squareDecimeter: "平方分米",
    squareCentimeter: "平方厘米",
    squareMillimeter: "平方毫米",
    hectare: "公顷",
    acre: "英亩",
    squareFoot: "平方英尺",
    cubicMeter: "立方米",
    cubicDecimeter: "立方分米",
    cubicCentimeter: "立方厘米",
    cubicMillimeter: "立方毫米",
    liter: "升",
    milliliter: "毫升",
    gallon: "加仑",
    cubicFoot: "立方英尺",

    // Color
    customColor: "自定义颜色",
    avatar: "头像",
    nickname: "昵称",
    inputNickname: "请输入昵称",
    pleaseInputNickname: "请输入您的昵称",
    loginSuccess: "登录成功",
    logout: "退出登录",
    confirmModify: "确认修改",
    // color card
    colorCard: "色卡",
    selectColor: "选择颜色",
    addToFavorites: "加入收藏",
    removeFromFavorites: "从收藏中移除",
    favorites: "收藏夹",

    colorConverter: "颜色转化",
    hexValue: "HEX 色值",
    rgbValue: "RGB 色值",
    hslValue: "HSL 色值",
    invalidHexFormat: "请输入有效的HEX格式",
    invalidRgbValue: "请输入0-255的数值",
    // crypto
    cryptoInputTips: "请输入文本",
    cryptoErrorAES: "AES KEY需要16/24/32字节长度",
    cryptoErrorDES: "DES KEY需要8字节长度",
    cryptoHandleFailed: "转义失败",
    cryptoEncode: "转义",
    cryptoDecode: "解析",
    cryptoAlgorithm: "转义算法",
    cryptoInputKeyTips: "请输入密钥",
    cryptoInputEncodeContentTips: "请输入要转义的文本",
    cryptoInputDecodeContentTips: "请输入要回复的文本",
    cryptoProcessing: "转义中",
    cryptoStartEncrypt: "开始转义",
    cryptoStartDecrypt: "开始回复",
    cryptoHandleResult: "转义结果",
    cryptoCopyResult: "复制结果",
    cryptoCopyResultTips: "已复制到剪贴板",
  },
  en: {
    // common
    delete: "Delete",
    start: "Start",
    slotMachine: "Slot",
    default: "Default",
    change: "Change",
    ge: " ",
    item: "Item",
    selected: "Selected",
    copy: "Copy",
    success: "Success",
    failed: "Failed",

    // dialog
    confirm: "Confirm",
    cancel: "Cancel",
    info: "Info",

    home: 'Home',
    adLoading: 'Loading Advertisement',
    adError: 'Failed to Load Advertisement',
    adClose: 'Close Advertisement',
    profile: 'Profile',
    calendar: 'Calendar',
    pleaseInput: "Please input ",
    // roulette
    roulette: 'Roulette',
    rouletteCreate: "Create a Roulette",
    rouletteCurrent: "Current Roulette",
    rouletteConfigList: "Roulette List",
    rouletteSetConfig: "Config Roulette",
    rouletteChoiceHistory: "Choice History",
    rouletteChoiceTip: "The choice is:",
    spinning: "Spinning",
    rouletteEmpty: "Roulette is empty",

    rouletteList: 'Roulette-List',
    rouletteListNoItems: 'No available Roulette, click to create a Roulette',
    rouletteListDeleteTip: 'Are you sure you want to delete this Roulette?',
    rouletteHistory: 'Roulette-History',
    rouletteHistoryDeleteTip: 'Are you sure you want to delete this history item?',
    rouletteHistoryNoItems: 'No history',

    rouletteConfig: 'Roulette-Config',
    rouletteConfigName: 'Name',
    rouletteConfigDescription: 'Description',
    rouletteConfigItemName: 'ItemName',
    rouletteConfigItemColor: 'ItemColor',
    rouletteConfigItemProbability: 'Probability',
    rouletteConfigItemProbabilityPlaceholder: 'Optional,default is average probability',
    updateItem: "Save Item",
    saveConfig: "Save Config",

    about: 'About',
    setting: 'Settings',
    darkMode: 'Dark Mode',
    tools: 'Tools',
    toolsDescription: 'A comprehensive toolkit featuring time management tools, calculators, image processors, and lifestyle utilities. Free and easy to use, designed to enhance your daily productivity and creativity.',
    language: 'Language',
    settingLang: 'Setting Language',
    settingLangPlaceholder: 'Please select the language',
    settingDarkMode: 'Setting Dark Mode',
    chinese: 'Chinese',
    english: 'English',
    notLoggedIn: 'Not Logged In',
    login: 'Login',
    appInfo: 'App Info',
    appName: 'App Name',
    appVersion: 'Version',
    appDescription: 'Description',
    appDescriptionContent: 'A useful tool collections, you can find all you need here.',
    appAuthor: 'Developer',
    appGithub: 'GitHub Repository',
    appIssue: 'Submit Issue',
    appDonate: 'Donate Support',
    appDonateTip: 'Thanks for your support! Long press the image to recognize the QR code.',
    // Tool Categories
    timeTools: "Time tools",
    calculatorTools: "Calculator tools",
    lifeTools: "Life tools",
    artTools: "Art tools",
    // Calculator Tools
    calculator: "Calculator",
    clear: "Clear",
    rad: "RAD",
    deg: "DEG",
    bit: "bit",
    and: "AND",
    or: "OR",
    xor: "XOR",
    not: "NOT",
    shl: "SHL",
    shr: "SHR",
    laborSalaryCalculator: "Labor Law Salary Calculator",
    dailyWorkTimeExceeded: "Daily working time exceeds 12 hours",
    dailyOvertimeExceeded: "Daily overtime exceeds 3 hours",
    monthlyOvertimeExceeded: "Monthly overtime exceeds 36 hours",
    worthyCalculatorDesc: "Calculate actual salary and overtime pay",
    baseSalary: "Base Salary (Yuan/Month)",
    workHours: "Daily Work Hours (Hours/Day)",
    weekendHours: "Monthly Weekend Overtime Hours (Hours/Month)",
    holidayHours: "Monthly Holiday Overtime Hours (Hours/Month)",
    normalPay: "Normal Pay",
    workdayOvertimePay: "Workday Overtime Pay",
    weekendOvertimePay: "Weekend Overtime Pay",
    holidayOvertimePay: "Holiday Overtime Pay",
    totalPay: "Total Pay",
    isLegal: "Legal Status",
    violations: "Violations",
    calculateSalary: "Calculate Actual Salary",
    legalStatus: "✅ Salary calculation complies with labor law",
    illegalStatus: "⚠️ Labor law violations exist",
    invalidExpression: "Invalid Expression",

    // Time Tools
    countdown: "Countdown Timer",
    timeDiff: "Time Difference",
    worldClock: "World Clock",
    // Countdown
    timeSelect: "Time Selection",
    pause: "Pause",
    reset: "Reset",
    presetTime: "Preset Time",
    countdownEnd: "Time is out",

    // Time Diff
    startTime: "Start Time",
    endTime: "End Time",
    timeDifference: "Time Difference",
    year: "Year",
    month: "Month",
    week: "Week",
    day: "Day",
    hour: "Hour",
    second: "Second",
    minute: "Minutes",
    quickOptions: "Quick Options",
    oneWeekAgo: "One Week Ago",
    oneMonthAgo: "One Month Ago",
    oneYearAgo: "One Year Ago",
    nextWeek: "Next Week",
    // World Clock
    selectTimezone: "Select Timezone",
    addTimezone: "Add Timezone",
    shanghai: "ShangHai",
    newYork: "New York",
    london: "London",
    tokyo: "Tokyo",
    sydney: "Sydney",
    paris: "Paris",
    losAngeles: "Los Angeles",
    dubai: "Dubai",
    singapore: "Singapore",
    moscow: "Moscow",
    // Calculator Tools
    scientificMode: "Scientific Mode",
    basicMode: "Basic Mode",
    programmerMode: "Programmer Mode",
    sqrt: "√",
    mortgage: "Mortgage Calculator",
    unitConverter: "Unit Converter",
    bmi: "BMI Calculator",
    crypto: "Text Transform",
    // Life Tools
    qrcode: "QR Code",
    enterText: "Enter Text",
    generate: "Generate",
    scan: "Scan",
    verify: "Verify",
    save: "Save",
    saveSuccess: "Save Success",
    saveFailed: "Save Failed",
    scanFromCamera: "Scan from Camera",
    scanFromAlbum: "Scan from Album",
    scanFailed: "Scan Failed",
    decodeFailed: "Decode Failed",
    chooseImageFailed: "Choose Image Failed",
    copySuccess: "Copy Success",
    userCanceled: "User Canceled",
    cameraPermissionDenied: "Camera Permission Denied",
    // Mortgage Calculator
    loanAmount: "Loan Amount",
    loanAmountUnit: "Yuan",
    loanTerm: "Loan Term",
    loanTermUnit: "Years",
    interestRate: "Annual Interest Rate",
    interestRateUnit: "%",
    equalPayment: "Equal Payment",
    equalPrincipal: "Equal Principal",
    calculate: "Calculate",
    monthlyPayment: "First Monthly Payment",
    totalPayment: "Total Payment",
    totalInterest: "Total Interest",
    paymentSchedule: "Payment Schedule",
    period: "Period",
    periodUnit: " ",
    monthlyPaymentLabel: "Monthly Payment",
    principalLabel: "Principal",
    interestLabel: "Interest",
    remainingPrincipal: "Remaining Principal",
    // BMI Calculator
    height: "Height",
    heightUnit: "cm",
    weight: "Weight",
    weightUnit: "kg",
    bmiIndex: "BMI Index",
    bmiCategory: "Weight Category",
    bmiAdvice: "Health Advice",
    bmiReference: "BMI Reference",
    underweight: "Underweight",
    underweightAdvice: "It is recommended to increase nutrition intake appropriately, maintain a balanced diet, and exercise moderately to enhance physical fitness.",
    normal: "Normal Weight",
    normalAdvice: "Congratulations! Please continue to maintain a healthy lifestyle.",
    overweight: "Overweight",
    overweightAdvice: "It is recommended to control diet intake, increase exercise, and gradually reduce weight to normal range.",
    obese: "Obese",
    obeseAdvice: "Need to pay attention to diet control, regular exercise, and consult a doctor or nutritionist if necessary.",
    severelyObese: "Severely Obese",
    severelyObeseAdvice: "It is recommended to lose weight under the guidance of a doctor, pay attention to diet control and moderate exercise.",

    // Unit Converter
    length: "Length",
    area: "Area",
    volume: "Volume",
    unitCategory: "Unit Category",
    selectUnit: "Select unit",
    selectTargetUnit: "Select target unit",
    invalidInput: "Invalid input",
    kilometer: "Kilometer",
    meter: "Meter",
    decimeter: "Decimeter",
    centimeter: "Centimeter",
    millimeter: "Millimeter",
    mile: "Mile",
    yard: "Yard",
    foot: "Foot",
    inch: "Inch",
    squareKilometer: "Square Kilometer",
    squareMeter: "Square Meter",
    squareDecimeter: "Square Decimeter",
    squareCentimeter: "Square Centimeter",
    squareMillimeter: "Square Millimeter",
    hectare: "Hectare",
    acre: "Acre",
    squareFoot: "Square Foot",
    cubicMeter: "Cubic Meter",
    cubicDecimeter: "Cubic Decimeter",
    cubicCentimeter: "Cubic Centimeter",
    cubicMillimeter: "Cubic Millimeter",
    liter: "Liter",
    milliliter: "Milliliter",
    gallon: "Gallon",
    cubicFoot: "Cubic Foot",
    // Color
    customColor: "Custom Color",
    avatar: "Avatar",
    nickname: "Nickname",
    inputNickname: "Input Nickname",
    pleaseInputNickname: "Please input your nickname",
    loginSuccess: "Login Success",
    logout: "Logout",
    confirmModify: "Confirm Modify",
    // Image Tools
    imageCompressor: "Image Compress",
    imageFilter: "Image Filter",
    startCompress: "Start Compress",
    addImage: "Add Image",
    chooseImage: "Choose Image",
    supportFormat: "Support JPG/PNG format",
    maxSize: "Max 5MB",
    pleaseChooseImage: "Please choose an image first",
    compressComplete: "Compression complete",
    compressFailed: "Compression failed",
    pleaseCompressFirst: "Please compress the image first",
    savedToAlbum: "Saved to album",
    originalImage: "Original image",
    compressedImage: "Compressed",
    saved: "Saved",
    compressionRatio: "Saved",
    bestQuality: "Best quality already",
    quality: "Quality",
    size: "Size",
    exportImage: "Export Image",
    // Filter
    original: "Original",
    vintage: "Vintage",
    blackAndWhite: "Black & White",
    invert: "Invert",
    softLight: "Soft Light",
    vivid: "Vivid",
    imageLoaded: "Image loaded",
    imageLoadFailed: "Failed to load image",
    presetFilters: "Preset Filters",
    customAdjust: "Custom Adjust",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    hue: "Hue",
    blur: "Blur",
    // color card
    colorCard: "Color Card",
    selectColor: "Select Color",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    favorites: "Favorites",

    colorConverter: "Color Converter",
    hexValue: "HEX Value",
    rgbValue: "RGB Value",
    hslValue: "HSL Value",
    invalidHexFormat: "Please enter a valid HEX format",
    invalidRgbValue: "Please enter a value between 0-255",
    // crypto
    cryptoInputTips: "Please input the text to be transformed or parsed",
    "cryptoErrorAES": "AES key requires 16/24/32 bytes length",
    "cryptoErrorDES": "DES key requires 8 bytes length",
    "cryptoHandleFailed": "Processing failed",
    "cryptoEncode": "Transform",
    "cryptoDecode": "Parse",
    "cryptoAlgorithm": "Transform Algorithm",
    "cryptoInputKeyTips": "Enter Transform key",
    "cryptoInputEncodeContentTips": "Enter text to transform",
    "cryptoInputDecodeContentTips": "Enter text to Parse",
    "cryptoProcessing": "Processing",
    "cryptoStartEncrypt": "Start Transform",
    "cryptoStartDecrypt": "Start Parse",
    "cryptoHandleResult": "Processing Result",
    "cryptoCopyResult": "Copy Result",
    "cryptoCopyResultTips": "Copied to clipboard"
  }
};
