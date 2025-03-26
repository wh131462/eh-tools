export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/profile/index',
    'pages/profile/info/index',
    'pages/about/index',
    'pages/setting/index',
    'pages/calendar/index',
    'pages/color-card/index',
    'pages/game2048/index',
    'pages/game2048/history/index',
    'pages/game2048/game/index',
    'pages/roulette/index/index',
    'pages/roulette/config/index',
    'pages/roulette/list/index',
    'pages/roulette/history/index'
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
