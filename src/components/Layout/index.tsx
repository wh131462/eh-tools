import { View } from '@tarojs/components';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';
import './index.less'
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  console.log("暗黑模式", isDarkMode)
  useEffect(() => {
    // 设置页面样式类
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage) {
      const pageInstance = currentPage;
      pageInstance.setData({
        darkMode: isDarkMode ? 'dark-mode' : ''
      });
    }

    // 设置底部导航栏主题
    const tabBarPages = ['/pages/index/index', '/pages/profile/index'];
    if (currentPage && tabBarPages.includes(currentPage.route!)) {
      Taro.setTabBarStyle({
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
        borderStyle: isDarkMode ? 'black' : 'white',
        color: isDarkMode ? '#8a8a8a' : '#7d7e80',
        selectedColor: isDarkMode ? '#64b5f6' : '#2196f3'
      });
    }
  }, [isDarkMode]);

  return (
    <View className={isDarkMode ? 'dark-mode' : ''}>
      {children}
    </View>
  );
};

export default Layout;
