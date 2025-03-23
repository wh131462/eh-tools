import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Dialog} from '@nutui/nutui-react-taro';
import './index.less';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {deleteConfig, RouletteConfig} from "@/store/slices/rouletteSlice";
import Taro from "@tarojs/taro";
import {formatDate} from "@/utils/date";

const RouletteListPage: React.FC = () => {
  const dispatch = useDispatch()
  const configs = useSelector((state: RootState) => state.roulette.configs);
  const [visible, setVisible] = useState(false)
  const handleNavigation = (config?: RouletteConfig) => {
    Taro.navigateTo({url: '/pages/roulette/config/index' + (config && `?id=${config?.id}` || '')});
  };

  return (
    <View className='roulette-list'>
      {configs.map(config => (
        <View><Cell
          key={config.id}
          title={
            <View>{config.name} ({config.items.length}个选项) </View>
          }
          description={<View>
            <span>{config.description}</span>
            <span>{formatDate(config.createTime, 'yyyy-MM-dd HH:mm:ss')}</span>
          </View>}
          extra={<View><Button block type="primary"
                               onClick={(e) => {
                                 e.stopPropagation()
                                 setVisible(true)
                               }}>删除</Button>
          </View>}
          onClick={() => handleNavigation(config)}
        />
          <Dialog
            visible={visible}
            onClose={() => setVisible(false)}
            title='确认删除'
            content={`确定要删除合集[${config.name}]吗？`}
            onCancel={() => setVisible(false)}
            onConfirm={() => {
              dispatch(deleteConfig(config.id))
            }}></Dialog></View>
      ))}

      {!configs.length && <View className='no-items'>无可用合集,点击创建合集开始创建吧~</View>}
      <Button block type="primary" onClick={() => handleNavigation()}>创建合集</Button>
    </View>
  );
};

export default RouletteListPage;
