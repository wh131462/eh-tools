import React from 'react';
import { View } from '@tarojs/components';
import {CalendarCard, CalendarCardDay} from '@nutui/nutui-react-taro';
import './index.less';

interface CalendarProps {
  marks?: Array<{ value: string; color: string }>;
  onDayClick?: (date: string) => void;
  isLunar?: boolean;
}

const CalendarComponent: React.FC<CalendarProps> = ({
  marks = [],
  isLunar = false
}) => {
  const renderDayTop = (day: CalendarCardDay) => {
    return day.date === 8 ? '☺' : ''
  }
  const renderDay = (day: CalendarCardDay) => {
    return day.date <= 9 ? `0${day.date}` : day.date
  }
  const renderDayBottom = (day: CalendarCardDay) => {
    return day.date === 8 ? '节日' : ''
  }
  return (
    <View className='calendar-component'>
      <CalendarCard
        renderDayTop={renderDayTop}
        renderDay={renderDay}
        renderDayBottom={renderDayBottom}
      />
    </View>
  );
};

export default CalendarComponent;
