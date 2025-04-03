export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/profile/index',
    'pages/profile/info/index',
    'pages/about/index',
    'pages/setting/index',
    'pages/calendar/index',
    'pages/color-card/index',
    'pages/roulette/index/index',
    'pages/roulette/config/index',
    'pages/roulette/list/index',
    'pages/roulette/history/index',
    "pages/time/countdown/index",
    "pages/time/diff/index",
    "pages/time/world-clock/index",
    "pages/calculator/calculator/index",
    "pages/calculator/labor-salary-calculator/index",
    "pages/calculator/bmi/index",
    "pages/calculator/mortgage/index",
    "pages/calculator/unit-converter/index",
    'pages/qrcode/index',
    'pages/crypto/index',
    'pages/color-converter/index',
    'pages/image/compress/index',
    'pages/image/filter/index'
  ],
  darkmode: true,
  themeLocation: 'theme.json',
  window: {
    backgroundTextStyle: '@textStyle',
    backgroundColor: '@bgColor',
    navigationBarTextStyle: '@navTextStyle',
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTitleText: 'EH工具库'
  },
  tabBar: {
    color: '@navTextColor',
    selectedColor: '@navTextSelectColor',
    backgroundColor: '@navBgColor',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '工具',
        iconPath: '@homePath',
        selectedIconPath: '@homePathActive'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: '@profilePath',
        selectedIconPath: '@profilePathActive'
      }
    ]
  }
})
