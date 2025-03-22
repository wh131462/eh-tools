interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  zh: {
    home: '首页',
    profile: '我的',
    calendar: '日历',
    roulette: '转盘',
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
    appDescription: '一个实用的小工具集合',
    appAuthor: '开发者',
    appGithub: '项目地址',
  },
  en: {
    home: 'Home',
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
    appDescription: 'A collection of useful tools',
    appAuthor: 'Developer',
    appGithub: 'GitHub Repository'
  }
};
