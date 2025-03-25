import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {CalendarCard, CalendarCardDay} from '@nutui/nutui-react-taro';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setSelectedDate} from '@/store/slices/calendarSlice';
import LunarUtil from '@/utils/lunar';
import Lunar from '@/utils/lunar';
import './index.less';

interface CalendarProps {
  onDayClick?: (date: string) => void;
  isLunar?: boolean;
}

interface LunarInfo {
  date: string;
  lunarDate: string;
  ganZhi: string;
  animal: string;
  solarTerm: string | null;
  holiday: string | null;
}

const CalendarComponent: React.FC<CalendarProps> = ({
                                                      isLunar = false
                                                    }) => {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector(state => state.calendar.schedules);
  const [showLunarInfo, setShowLunarInfo] = useState(false);
  const [currentLunarInfo, setCurrentLunarInfo] = useState<LunarInfo | null>(null);
  const hasSchedule = (date: Date) => {
    return schedules.some(o => o.date === date.valueOf())
  }
  const handleDayClick = (day: CalendarCardDay) => {
    const dateStr = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    const date = new Date(dateStr)
    dispatch(setSelectedDate(date));
    const lunarDay = LunarUtil.getLunarDay(date);
    setCurrentLunarInfo({
      date: dateStr,
      lunarDate: lunarDay.getLunarDay().toString(),
      ganZhi: LunarUtil.getGanZhiYear(day.year),
      animal: LunarUtil.getAnimalYear(day.year),
      solarTerm: LunarUtil.getSolarTerm(date),
      holiday: Lunar.getFestival(date)
    });
    setShowLunarInfo(true);
  };

  const renderDayTop = (day: CalendarCardDay) => {
    return hasSchedule(new Date(day.year, day.month - 1, day.date,)) ? <View className='hot-point'></View> : null;
  };

  const renderDay = (day: CalendarCardDay) => {
    return (
      <View className="day-container">
        <View>{day.date <= 9 ? `0${day.date}` : day.date}</View>
      </View>
    );
  };

  const renderDayBottom = (day: CalendarCardDay) => {
    if (!isLunar) return '';
    const date = new Date(`${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`);
    const festival = Lunar.getFestival(date);
    if (festival) return <View className='lunar-festival'>{festival}</View>;
    return <View className='lunar-date'>{LunarUtil.getShortLunarDate(date)}</View>;
  };

  return (
    <View className='calendar-component'>
      <CalendarCard
        renderDayTop={renderDayTop}
        renderDay={renderDay}
        renderDayBottom={renderDayBottom}
        onDayClick={handleDayClick}
      />

      {showLunarInfo ? currentLunarInfo && (
        <View className='lunar-info'>
          <View className='lunar-date'>{currentLunarInfo.lunarDate}</View>
          <View className='lunar-detail'>
            <View>天干地支：{currentLunarInfo.ganZhi}</View>
            <View>生肖：{currentLunarInfo.animal}</View>
            {currentLunarInfo.solarTerm && (
              <View>所处节气：{currentLunarInfo.solarTerm}</View>
            )}
            {currentLunarInfo.holiday && (
              <View>节日：{currentLunarInfo.holiday}</View>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default CalendarComponent;
