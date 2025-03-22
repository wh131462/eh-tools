import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppSelector } from '@/store/hooks';
import { updateTabBarText, updatePageTitle } from '@/i18n/utils';
import Taro, { useDidShow } from '@tarojs/taro';
import './app.less';

const AppContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useAppSelector(state => state.app);

  useDidShow(() => {
    updateTabBarText(language);
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.route) {
      updatePageTitle(language, currentPage.route);
    }
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const pages = Taro.getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route) {
        updatePageTitle(language, currentPage.route);
      }
    };

    Taro.eventCenter.on('routeChange', handleRouteChange);
    return () => {
      Taro.eventCenter.off('routeChange', handleRouteChange);
    };
  }, [language]);

  return (
    <>
      {children}
    </>
  );
};

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <AppContent>{children}</AppContent>
    </Provider>
  );
};

export default App;
