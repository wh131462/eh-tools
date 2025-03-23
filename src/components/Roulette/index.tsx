import React, {useEffect, useRef, useState} from 'react';
import {View} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {Button} from '@nutui/nutui-react-taro';
import {LuckyWheel, SlotMachine} from '@lucky-canvas/taro/react'
import './index.less';

import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/store';
import {addHistory} from "@/store/slices/rouletteSlice";

interface RouletteProps {
  maxItems?: number;
  mode?: 'roulette' | 'slot';
  onResult?: (item: { id: string; name: string }) => void;
}

const RouletteComponent: React.FC<RouletteProps> = ({
                                                      onResult,
                                                      mode = 'roulette'
                                                    }) => {
  const dispatch = useDispatch()
  const currentConfig = useSelector((state: RootState) => state.roulette.currentConfig);
  const ref = useRef<LuckyWheel | SlotMachine>(null);
  const [wheelWidth, setWheelWidth] = useState('200px');
  const [isSpinning, setIsSpinning] = React.useState(false);

  const [rouletteState, setRouletteState] = useState<any>(null)
  const [slotState, setSlotState] = useState<any>();

  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const initState = () => {
    if (currentConfig) {
      if (mode === 'roulette') {
        setRouletteState({
          blocks: [{padding: '10px', background: '#E44537'}],
          prizes: currentConfig.items.map((item, index) => ({
            id: item.id,
            name: item.name,
            fonts: [{text: item.name, fontColor: "#FFFFFF", top: "10px"}],
            background: item.color || `hsl(${(360 / currentConfig.items.length) * index}, 70%, 50%)`
          })),
          buttons: [
            {radius: '50px', background: '#f5f5f5'},
            {radius: '45px', background: '#e8e8e8'},
            {
              radius: '40px', background: '#E54535',
              pointer: true,
            },],
          defaultConfig: {
            gutter: 5,
            offsetDegree: 0,
            speed: 20,
            accelerationTime: 2500,
            decelerationTime: 2500
          },
        })
      } else {
        setSlotState({
          width: '240px',
          height: '180px',
          blocks: [
            {padding: '10px', background: '#E54535', borderRadius: "10px"},
            {padding: '10px', background: '#e9e8fe', borderRadius: "10px"},
          ],
          slots: [
            {speed: 5},
            {speed: 8},
            {speed: 7},
          ],
          prizes: currentConfig?.items.map((item) => ({
            id: item.id,
            name: item.name,
            fonts: [{text: item.name, fontColor: "#FFFFFF", top: "18px", wordWrap: false, lineClamp: 1}],
            background: '#E54535',
            borderRadius: '10px',
          })) || [],
          defaultConfig: {
            rowSpacing: '10px',
            colSpacing: '10px',
          }
        })
      }
    }
  }
  const handleStart = () => {
    if (isSpinning || currentConfig?.items.length === 0) return;
    setIsSpinning(true);
    ref.current?.play();
    setTimeout(() => {
      const index = Math.floor(Math.random() * (currentConfig?.items?.length ?? 0));
      ref.current.stop(index)
    }, 1000)
  };

  const handleEnd = (prize: any) => {
    setIsSpinning(false);
    const result = {id: prize.id, name: prize.name};
    setSelectedItem(result);
    onResult?.(result);

    // 添加历史记录
    if (currentConfig) {
      dispatch(addHistory({
        id: Date.now().toString(),
        configId: currentConfig.id,
        configName: currentConfig.name,
        selectedItem: result,
        timestamp: Date.now()
      }));
    }
  };
  const initWidth = () => {
    const {windowWidth} = Taro.getWindowInfo();
    const width = Math.floor(windowWidth * 0.7);
    setWheelWidth(`${width}px`);
  }
  useEffect(() => {
    initState()
    initWidth()
    console.log("current", currentConfig, rouletteState)
  }, [currentConfig, mode]);

  return (
    <View className='roulette-component'>
      {
        currentConfig && (mode === 'roulette' && (
          rouletteState &&
          <LuckyWheel
            ref={ref}
            width={wheelWidth}
            height={wheelWidth}
            defaultConfig={rouletteState.defaultConfig}
            blocks={rouletteState.blocks}
            prizes={rouletteState.prizes}
            buttons={rouletteState.buttons}
            onEnd={handleEnd}
          />
        ) || (slotState && <SlotMachine
          ref={ref}
          defaultConfig={slotState.defaultConfig}
          width={wheelWidth}
          height={slotState.height}
          slots={slotState.slots}
          blocks={slotState.blocks}
          prizes={slotState.prizes}
          onEnd={handleEnd}
        />))
      }
      <Button
        type='primary'
        className='spin-button'
        disabled={isSpinning || currentConfig?.items.length === 0}
        onClick={handleStart}
      >
        {isSpinning ? '旋转中...' : '开始'}
      </Button>
      {selectedItem && (
        <View className='result'>
          选中: {selectedItem.name}
        </View>
      )}
    </View>
  );
};

export default RouletteComponent;
