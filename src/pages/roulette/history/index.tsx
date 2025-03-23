import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Dialog} from '@nutui/nutui-react-taro';
import './index.less';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {deleteHistory} from "@/store/slices/rouletteSlice";
import {formatDate} from "@/utils/date";

const RouletteHistoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.roulette.history);
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <View className='roulette-history'>
      {history.map(record => (
        <View key={record.id}>
          <Cell
            title={record.selectedItem.name}
            description={`${record.configName} · ${formatDate(record.timestamp, 'yyyy-MM-dd HH:mm:ss')}`}
            extra={<Button 
              type="primary" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(record.id);
                setVisible(true);
              }}
            >
              删除
            </Button>}
          />
          <Dialog
            visible={visible && selectedId === record.id}
            onClose={() => setVisible(false)}
            title='确认删除'
            content='确定要删除这条历史记录吗？'
            onCancel={() => setVisible(false)}
            onConfirm={() => {
              dispatch(deleteHistory(record.id));
              setVisible(false);
            }}
          />
        </View>
      ))}
      {!history.length && <View className='no-items'>暂无历史记录</View>}
    </View>
  );
};

export default RouletteHistoryPage;
