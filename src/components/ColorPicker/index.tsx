import {forwardRef, useImperativeHandle, useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Input, Popup} from '@nutui/nutui-react-taro';
import './index.less';
import {useTranslation} from "@/i18n";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

export interface ColorPickerRef {
  setColor: (color: string) => void;
  resetColor: () => void;
  openPicker: () => void;
  closePicker: () => void;
}

const presetColors = [
  '#FF416C', '#FF4B2B', '#4CAF50', '#2196F3',
  '#9C27B0', '#FF9800', '#795548', '#607D8B',
  '#E91E63', '#009688', '#673AB7', '#3F51B5',
  '#FFEB3B', '#CDDC39', '#8BC34A', '#00BCD4'
];

const ColorPicker = forwardRef<ColorPickerRef, ColorPickerProps>(({
                                                                    value,
                                                                    onChange
                                                                  }, ref) => {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);
  const [customColor, setCustomColor] = useState('');
  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onChange?.(color);
    setVisible(false);
  };

  useImperativeHandle(ref, () => ({
    setColor: (color: string) => {
      setCurrentColor(color);
      onChange?.(color);
    },
    resetColor: () => {
      setCurrentColor('');
      onChange?.('');
    },
    openPicker: () => setVisible(true),
    closePicker: () => setVisible(false)
  }));

  const handleCustomColorChange = (color: string) => {
    color = color
      .toUpperCase()
      .replace(/[^0-9A-F#]/g, ''); // 只保留十六进制字符和#号
    // 移除所有空格
    color = color.replace(/\s/g, '');
    // 如果输入超过6位，截取前6位
    if (color.startsWith('#') && color.length > 7) {
      color = color.slice(0, 7);
    } else if (!color.startsWith('#') && color.length > 6) {
      color = color.slice(0, 6);
    }
    // 如果没有#号前缀，自动添加
    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
      color = '#' + color;
    }
    // 转换为大写
    color = color.toUpperCase();
    setCustomColor(color);
  };

  const clearCustomColor = () => {
    setCustomColor('');
  };

  const saveCustomColor = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(customColor)) {
      handleColorChange(customColor.toUpperCase());
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
            <View className='custom-color-input-container'>
              <Input
                className='custom-color-input'
                type='text'
                placeholder='#RRGGBB'
                value={customColor ?? ''}
                onChange={handleCustomColorChange}
              />
              {customColor && (
                <View className='clear-button' onClick={clearCustomColor}>
                  ×
                </View>
              )}
            </View>
            <Button className='custom-color-input' type='primary' block onClick={saveCustomColor}>确认</Button>
          </View>
        </View>
      </Popup>
    </View>
  );
});

export default ColorPicker;
