import React, {useEffect, useState} from 'react';
import {View} from '@tarojs/components';
import './index.less';
import CalendarComponent from "@/components/Calendar";
import ScheduleManager from "@/components/Calendar/ScheduleManager/ScheduleManager";
import {useAppSelector} from "@/store/hooks";
import {usePageTitle} from "@/hooks/usePageTitle";
import {useShareAppMessage, useShareTimeline} from "@tarojs/taro";

const CalendarPage: React.FC = () => {
  const selectedDate = useAppSelector(state => state.calendar.selectedDate);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  usePageTitle("calendar")
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["calendar"]
  });
  useShareTimeline(() => {
    return shares["calendar"]
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
