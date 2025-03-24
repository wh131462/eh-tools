import React, {useEffect} from 'react';
import {View} from '@tarojs/components';
import './index.less';
import CalendarComponent from "@/components/Calendar";
import {useAppSelector} from "@/store/hooks";
import {updatePageTitle} from "@/i18n/utils";

const CalendarPage: React.FC = () => {
  const {language} = useAppSelector(state => state.app);

  useEffect(() => {
    updatePageTitle(language, 'calendar');
  }, [language]);

  return (
    <View className='calendar-page'>
      <CalendarComponent isLunar={true}></CalendarComponent>
    </View>
  );
};

export default CalendarPage;
