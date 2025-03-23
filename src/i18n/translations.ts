interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  zh: {
    home: '首页',
    adLoading: '广告加载中',
    adError: '广告加载失败',
    adClose: '关闭广告',
    profile: '我的',
    calendar: '万年历',
    roulette: '大转盘',
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
    notLoggedIn: '未登录',
    login: '登录',
    appInfo: '应用信息',
    appName: '应用名称',
    appVersion: '版本号',
    appDescription: '应用描述',
    appDescriptionContent: '一个有用的小程序合集,在这里找到你想要的~',
    appAuthor: '开发者',
    appGithub: '项目地址',
  },
  en: {
    home: 'Home',
    adLoading: 'Loading Advertisement',
    adError: 'Failed to Load Advertisement',
    adClose: 'Close Advertisement',
    profile: 'Profile',
    calendar: 'Calendar',
    roulette: 'Roulette',
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
    appGithub: 'GitHub Repository'
  }
};
