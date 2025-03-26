import React, {useEffect, useState} from 'react';
import {View} from '@tarojs/components';
import './index.less';
import CalendarComponent from "@/components/Calendar";
import ScheduleManager from "@/components/Calendar/ScheduleManager/ScheduleManager";
import {useAppSelector} from "@/store/hooks";
import {updatePageTitle} from "@/i18n/utils";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

const CalendarPage: React.FC = () => {
  const {language} = useAppSelector(state => state.app);
  const selectedDate = useAppSelector(state => state.calendar.selectedDate);
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  useEffect(() => {
    updatePageTitle(language, 'calendar');
  }, [language]);
  useShareAppMessage(() => {
    return {
      title: '万年历,查看今日黄历',
      path: '/pages/calendar/index',
      imageUrl: '/assets/shares/calendarShare.png'
    };
  });

  useShareTimeline(() => {
    return {
      title: '万年历,查看今日黄历',
      path: '/pages/calendar/index',
    };
  });

  useEffect(() => {
    if (selectedDate) {
      // setShowScheduleManager(true);
    }
  }, [selectedDate]);

  return (
    <View className='calendar-page'>
      <CalendarComponent isLunar={true}></CalendarComponent>
      <ScheduleManager
        visible={showScheduleManager}
        onClose={() => setShowScheduleManager(false)}
        selectedDate={selectedDate}
      />
    </View>
  );
};

export default CalendarPage;
