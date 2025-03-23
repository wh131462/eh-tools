import React, {useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Input, Popup} from '@nutui/nutui-react-taro';
import './index.less';
import {useTranslation} from "@/i18n";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

const presetColors = [
  '#FF416C', '#FF4B2B', '#4CAF50', '#2196F3',
  '#9C27B0', '#FF9800', '#795548', '#607D8B',
  '#E91E63', '#009688', '#673AB7', '#3F51B5',
  '#FFEB3B', '#CDDC39', '#8BC34A', '#00BCD4'
];

const ColorPicker: React.FC<ColorPickerProps> = ({
                                                   value,
                                                   onChange
                                                 }) => {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);
  const [customColor, setCustomColor] = useState('');
  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onChange?.(color);
    setVisible(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
  };
  const saveCustomColor = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      handleColorChange(customColor);
    }
  }

  return (
    <View className='color-picker-component'>
      <View
        className='color-preview'
        style={{backgroundColor: currentColor ?? 'transparent'}}
        onClick={() => setVisible(true)}
      />
      <Popup
        visible={visible}
        duration={300}
        position='bottom'
        onClose={() => setVisible(false)}
        style={{minHeight: '40vh'}}
      >
        <View className='color-picker-popup'>
          <Cell title={t("预设颜色")}></Cell>
          <View className='preset-colors'>
            {presetColors.map((color) => (
              <View
                key={color}
                className='color-item'
                style={{backgroundColor: color}}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </View>
          <View className='custom-color'>
            <Cell title={t("customColor")} description={t("可输入指定颜色值,格式为#RRGGBB")}
                  extra={<View className='custom-color-preview' style={{backgroundColor: customColor}}></View>}>
            </Cell>
            <Input
              className='custom-color-input'
              type='text'
              placeholder='#RRGGBB'
              value={customColor ?? ''}
              onChange={handleCustomColorChange}
            ></Input>
            <Button className='custom-color-input' type='primary' block onClick={saveCustomColor}>确认</Button>
          </View>
        </View>
      </Popup>
    </View>
  );
};

export default ColorPicker;
