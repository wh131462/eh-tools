import React from 'react';
import { View } from '@tarojs/components';
import './index.less';
import CalendarComponent from "@/components/Calendar";

const CalendarPage: React.FC = () => {
  const handleDayClick = (date: string) => {
    console.log('Selected date:', date);
  };

  return (
    <View className='calendar-page'>
      <CalendarComponent onDayClick={handleDayClick}></CalendarComponent>
    </View>
  );
};

export default CalendarPage;
