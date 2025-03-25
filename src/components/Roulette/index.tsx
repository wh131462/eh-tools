import React, {useEffect, useRef, useState} from 'react';
import {View} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {Button} from '@nutui/nutui-react-taro';
import {LuckyWheel, SlotMachine} from '@lucky-canvas/taro/react'
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/store';
import {addHistory} from "@/store/slices/rouletteSlice";
import {useTranslation} from "@/i18n";
import './index.less';

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
  const {t} = useTranslation()
  const currentConfig = useSelector((state: RootState) => state.roulette.currentConfig);
  const ref = useRef<LuckyWheel | SlotMachine>(null);
  const [wheelWidth, setWheelWidth] = useState('200px');
  const [isSpinning, setIsSpinning] = useState(false);

  const [rouletteState, setRouletteState] = useState<any>(null)
  const [slotState, setSlotState] = useState<any>();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const initState = () => {
    if (currentConfig) {
      if (mode === 'roulette') {
        setRouletteState({
          blocks: [
            {
              padding: '10px',
              background: '#FF6F00'
            },
            {
              padding: '10px',
              background: '#FFEE58',
            },
          ],
          prizes: currentConfig.items.map((item, index) => ({
            id: item.id,
            name: item.name,
            fonts: [{text: item.name, fontColor: "#FFFFFF", top: "10px"}],
            background: item.color || `hsl(${(360 / currentConfig.items.length) * index}, 70%, 50%)`
          })),
          buttons: [
            {radius: '20%', background: '#FFEE58'},
            {
              radius: '15%',
              background: '#FF6F00',
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
        const slotColors = ["#FFB300", "#FF8F00", "#D84315"];
        const radius = ["10px", "30px", "50px"];
        setSlotState({
          width: '240px',
          height: '180px',
          blocks: [
            {padding: '10px', background: '#FF6D00', borderRadius: "20px"},
            {padding: '10px', background: '#FFF3E0', borderRadius: "25px"},
          ],
          slots: [
            {speed: 10},
            {speed: 20},
            {speed: 15},
          ],
          prizes: currentConfig?.items.map((item, index) => ({
            id: item.id,
            name: item.name,
            fonts: [{text: item.name, fontColor: "#FFFFFF", top: "10px", wordWrap: true, lineClamp: 1}],
            background: slotColors.at(index % slotColors.length),
            borderRadius: radius.at(index % slotColors.length),
          })) || [],
          defaultConfig: {
            rowSpacing: '10px',
            colSpacing: '10px',
            mode: 'horizontal',
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
    setTimeout(() => {
      onResult?.(result);
    }, 500)
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
    setTimeout(() => {
      ref.current?.hideCanvas()
      setSelectedItem(null);
    }, 500)
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
      {
        !currentConfig && (
          <View className='empty'>
            {t('rouletteEmpty')}
          </View>
        )
      }
      <Button
        type='primary'
        className='spin-button'
        disabled={currentConfig === null || isSpinning || currentConfig?.items.length === 0}
        onClick={handleStart}
      >
        {isSpinning ? t('spinning') + '...' : t('start')}
      </Button>
      {selectedItem && (
        <View className='result'>
          {t('selected')} : {selectedItem.name}
        </View>
      )}
    </View>
  );
};

export default RouletteComponent;
