import React, {useEffect, useState} from 'react';
import {View} from '@tarojs/components';
import './index.less';
import CalendarComponent from "@/components/Calendar";
import ScheduleManager from "@/components/Calendar/ScheduleManager/ScheduleManager";
import {useAppSelector} from "@/store/hooks";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";
import {usePageTitle} from "@/hooks/usePageTitle";

const CalendarPage: React.FC = () => {
  const selectedDate = useAppSelector(state => state.calendar.selectedDate);
  const [showScheduleManager, setShowScheduleManager] = useState(false);

  usePageTitle("calendar")

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
