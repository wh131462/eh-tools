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

    // Color
    customColor: "自定义颜色",
    avatar: "头像",
    nickname: "昵称",
    inputNickname: "请输入昵称",
    pleaseInputNickname: "请输入您的昵称",
    loginSuccess: "登录成功",
    logout: "退出登录",
    confirmModify: "确认修改",
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
    pleaseInput: "Please input",
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

    // Color
    customColor: "Custom Color",
    avatar: "Avatar",
    nickname: "Nickname",
    inputNickname: "Input Nickname",
    pleaseInputNickname: "Please input your nickname",
    loginSuccess: "Login Success",
    logout: "Logout",
    confirmModify: "Confirm Modify"
  }
};
