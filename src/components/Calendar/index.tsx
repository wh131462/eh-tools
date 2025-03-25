import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {CalendarCard, CalendarCardDay, Popup} from '@nutui/nutui-react-taro';
import {useAppDispatch} from '@/store/hooks';
import {setSelectedDate} from '@/store/slices/calendarSlice';
import LunarCalendar from '@/utils/lunar';
import './index.less';

interface CalendarProps {
  marks?: Array<{ value: string; color: string }>;
  onDayClick?: (date: string) => void;
  isLunar?: boolean;
}

interface LunarInfo {
  date: string;
  lunarDate: string;
  ganZhi: string;
  animal: string;
  solarTerm: string | null;
}

const CalendarComponent: React.FC<CalendarProps> = ({
                                                      marks = [],
                                                      isLunar = false
                                                    }) => {
  const dispatch = useAppDispatch();
  const [showLunarInfo, setShowLunarInfo] = useState(false);
  const [currentLunarInfo, setCurrentLunarInfo] = useState<LunarInfo | null>(null);

  const handleDayClick = (day: CalendarCardDay) => {
    const date = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
    dispatch(setSelectedDate(date));

    const lunar = LunarCalendar.solarToLunar({
      year: day.year,
      month: day.month,
      day: day.date
    });

    setCurrentLunarInfo({
      date,
      lunarDate: `${lunar.year}年${lunar.month}月${lunar.day}日}`,
      ganZhi: LunarCalendar.getGanZhiYear(lunar.year),
      animal: LunarCalendar.getAnimalYear(lunar.year),
      solarTerm: LunarCalendar.getSolarTerm(day.month, day.date)
    });
    setShowLunarInfo(true);
  };

  const renderDayTop = (day: CalendarCardDay) => {
    return ""
    // const solarTerm = LunarCalendar.getSolarTerm(day.month, day.date);
    // return solarTerm || '';
  };

  const renderDay = (day: CalendarCardDay) => {
    return day.date <= 9 ? `0${day.date}` : day.date;
  };

  const renderDayBottom = (day: CalendarCardDay) => {
    if (!isLunar) return '';
    const lunar = LunarCalendar.solarToLunar({
      year: day.year,
      month: day.month,
      day: day.date
    });
    return `${lunar.month}/${lunar.day}`;
  };

  return (
    <View className='calendar-component'>
      <CalendarCard
        renderDayTop={renderDayTop}
        renderDay={renderDay}
        renderDayBottom={renderDayBottom}
        onDayClick={handleDayClick}
      />
      <Popup
        visible={showLunarInfo}
        style={{padding: '30px 50px'}}
        onClose={() => setShowLunarInfo(false)}
      >
        {currentLunarInfo && (
          <View className='lunar-info'>
            <View className='lunar-date'>{currentLunarInfo.lunarDate}</View>
            <View className='lunar-detail'>
              <View>天干地支：{currentLunarInfo.ganZhi}</View>
              <View>生肖：{currentLunarInfo.animal}</View>
              {currentLunarInfo.solarTerm && (
                <View>节气：{currentLunarInfo.solarTerm}</View>
              )}
            </View>
          </View>
        )}
      </Popup>
    </View>
  );
};

export default CalendarComponent;
