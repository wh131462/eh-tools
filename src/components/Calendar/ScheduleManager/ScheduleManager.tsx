import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Form, Input, Popup, Radio} from '@nutui/nutui-react-taro';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {addSchedule, removeSchedule, Schedule} from '@/store/slices/calendarSlice';


interface ScheduleManagerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date | null;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
                                                           visible,
                                                           onClose,
                                                           selectedDate
                                                         }) => {
  const dispatch = useAppDispatch();
  const schedules = useAppSelector(state => state.calendar.schedules);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Schedule>({
    id: "",
    date: Date.now(),
    title: '',
    description: '',
    type: 'event',
    isRecurring: false
  });

  const handleAddSchedule = () => {
    if (!selectedDate) return;

    const newSchedule = {
      ...formData,
      date: new Date(selectedDate).valueOf(),
      id: Date.now().toString()
    };

    dispatch(addSchedule(newSchedule));
    setShowAddForm(false);
    setFormData({
      id: "",
      date: Date.now(),
      title: '',
      description: '',
      type: 'event',
      isRecurring: false
    });
  };

  const handleDeleteSchedule = (id: string) => {
    dispatch(removeSchedule(id));
  };

  const currentDateSchedules = schedules.filter(schedule => schedule.date === new Date(selectedDate!).valueOf());

  return (
    <Popup
      visible={visible}
      style={{height: '60%'}}
      position="bottom"
      onClose={onClose}
    >
      <View className="schedule-manager">
        <View className="schedule-header">
          <Button type="primary" onClick={() => setShowAddForm(true)}>添加日程</Button>
        </View>

        <View className="schedule-list">
          {currentDateSchedules.map(schedule => (
            <Cell
              key={schedule.id}
              title={schedule.title}
              description={schedule.description}
              extra={schedule.type === 'birthday' ? '🎂' : '📅'}
              onClick={() => handleDeleteSchedule(schedule.id)}
            />
          ))}
        </View>

        <Popup
          visible={showAddForm}
          style={{height: '50%'}}
          position="bottom"
          onClose={() => setShowAddForm(false)}
        >
          <Form>
            <Form.Item label="标题">
              <Input
                placeholder="请输入标题"
                value={formData.title}
                onChange={(val) => setFormData(prev => ({...prev, title: val}))}
              />
            </Form.Item>
            <Form.Item label="描述">
              <Input
                placeholder="请输入描述"
                value={formData.description}
                onChange={(val) => setFormData(prev => ({...prev, description: val}))}
              />
            </Form.Item>
            <Form.Item label="类型">
              <Radio.Group
                value={formData.type}
                onChange={(val) => setFormData(prev => ({...prev, type: val as any}))}
              >
                <Radio value="event">日程</Radio>
                <Radio value="birthday">生日</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="是否重复">
              <Radio.Group
                value={formData.isRecurring ? 'yes' : 'no'}
                onChange={(val) => setFormData(prev => ({...prev, isRecurring: val == 'yes'}))}
              >
                <Radio value={'yes'}>是</Radio>
                <Radio value={'no'}>否</Radio>
              </Radio.Group>
            </Form.Item>
            <Button block type="primary" onClick={handleAddSchedule}>确认</Button>
          </Form>
        </Popup>
      </View>
    </Popup>
  );
};

export default ScheduleManager;
