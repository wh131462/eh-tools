export default {
  pages: [
    'pages/index/index',
    'pages/me/index',
    // 工具页面
    'pages/calendar/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'EH工具库',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: '',
        iconPath: 'assets/icons/tools.png',
        selectedIconPath: 'assets/icons/tools.png'
      },
      {
        pagePath: 'pages/me/index',
        text: '',
        iconPath: 'assets/icons/me.png',
        selectedIconPath: 'assets/icons/me.png'
      }
    ]
  }
}
