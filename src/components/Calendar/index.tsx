import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {CalendarCard, CalendarCardDay} from '@nutui/nutui-react-taro';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setSelectedDate} from '@/store/slices/calendarSlice';
import LunarUtil from '@/utils/lunar';
import LunarUtils, {LunarInfo} from '@/utils/lunar';
import './index.less';

interface CalendarProps {
  onDayClick?: (date: string) => void;
  isLunar?: boolean;
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
    const lunarInfo = LunarUtil.solarToLunar(date);
    setCurrentLunarInfo(lunarInfo);
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
    const info = LunarUtils.solarToLunar(date);
    console.log(info)
    if (info.lunarFestival || info.solarFestival) return <View
      className='lunar-festival'>{info.solarFestival || info.lunarFestival}</View>;
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

      {showLunarInfo && currentLunarInfo && (
        <View className='lunar-info'>
          <View className='lunar-header'>
            <View className='lunar-date'>{currentLunarInfo.lunarDate}</View>
            <View className='ganzhi-section'>
              <View className='ganzhi-item'>{currentLunarInfo.ganZhiYear}({currentLunarInfo.zodiac})</View>
              <View className='ganzhi-item'>{currentLunarInfo.ganZhiMonth}月</View>
              <View className='ganzhi-item'>{currentLunarInfo.ganZhiDay}日</View>
            </View>
          </View>

          <View className='lunar-content'>
            <View className='action-section'>
              <View className='suitable'>
                <View className="tag icon-yi">宜</View>
                <View className="action-content">{currentLunarInfo.suitable}</View>
              </View>
              <View className='unsuitable'>
                <View className="tag icon-ji">忌</View>
                <View className="action-content">{currentLunarInfo.avoid}</View>
              </View>
            </View>

            <View className='grid-section'>
              <View className='info-section'>
                <View className="info-item">
                  <View className="label">建除十二神：</View>
                  <View className="value">{currentLunarInfo.jianchu}</View>
                </View>
                <View className="info-item">
                  <View className="label">节气：</View>
                  <View className="value">{currentLunarInfo.solarTerm || '无'}</View>
                </View>
                <View className="info-item">
                  <View className="label">二十八宿：</View>
                  <View className="value">{currentLunarInfo.twentyEightStar}</View>
                </View>
                <View className="info-item">
                  <View className="label">今日胎神：</View>
                  <View className="value">{currentLunarInfo.taishen}</View>
                </View>
                <View className="info-item">
                  <View className="label">彭祖百忌：</View>
                  <View className="value">{currentLunarInfo.pengzu}</View>
                </View>
              </View>
              <View className='info-section'>
                <View className="info-item">
                  <View className="label">三候：</View>
                  <View className="value">{currentLunarInfo.sanHou}</View>
                </View>
                <View className="info-item">
                  <View className="label">六曜：</View>
                  <View className="value">{currentLunarInfo.rokuyou}</View>
                </View>
                <View className="info-item">
                  <View className="label">九星：</View>
                  <View className="value">{currentLunarInfo.jiuXing}</View>
                </View>
              </View>
              <View className='info-section gods-section'>
                <View className='section-title'>吉凶神煞</View>
                <View className="god-group">
                  <View className="good-gods">
                    <View className="god-tag">吉神宜趋</View>
                    {currentLunarInfo.luckyGods.map(god => (
                      <View key={god} className="god-item">{god}</View>
                    ))}
                  </View>
                  <View className="bad-gods">
                    <View className="god-tag">凶神宜忌</View>
                    {currentLunarInfo.unluckyGods.map(god => (
                      <View key={god} className="god-item">{god}</View>
                    ))}
                  </View>
                </View>
              </View>
              <View className='info-section'>
                <View className='section-title'>时辰吉凶</View>
                <View className="time-grid">
                  {Object.entries(currentLunarInfo.hourLuck).map(([hour, luck]) => (
                    <View key={hour} className="time-item">
                      <View className="hour">{hour}</View>
                      <View className={`luck ${luck === '吉' ? 'good' : 'bad'}`}>{luck}</View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CalendarComponent;
