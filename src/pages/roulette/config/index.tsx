import React, {useEffect, useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Form, FormItemRuleWithoutValidator, Input} from '@nutui/nutui-react-taro';
import './index.less';
import ColorPicker from "@/components/ColorPicker";
import Taro from "@tarojs/taro";
import {RouletteConfig, RouletteItem, updateConfig} from "@/store/slices/rouletteSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {getCurrentInstance} from "@tarojs/runtime";

interface ConfigProps {
  id?: string;
}

const RouletteConfigPage: React.FC<ConfigProps> = () => {
  const instance = getCurrentInstance();
  const dispatch = useDispatch();
  const configs = useSelector((state: RootState) => state.roulette.configs);
  const newConfig: RouletteConfig = {createTime: Date.now(), items: [], id: Date.now().toString(), name: ""};
  const [config, setConfig] = useState<RouletteConfig>(newConfig);
  const [setForm] = Form.useForm()
  const [itemForm] = Form.useForm()
  useEffect(() => {
    const {id} = instance.router?.params ?? {};
    if (id) {
      const cur = configs.find(o => o.id == id)
      cur && setConfig(cur)
      console.log("cur", cur)
    }
  }, []);
  const handleName = () => {
    const newName = setForm.getFieldValue("name")
    setConfig({...config, name: newName})
  }
  const handleDescription = () => {
    const newDescription = setForm.getFieldValue("description")
    setConfig({...config, description: newDescription})
  }
  const getItems = () => {
    return config.items;
  }
  const setItems = (items: RouletteItem[]) => {
    setConfig({...config, items});
  }
  const handleUpdateItem = (newItem: RouletteItem) => {
    if (!newItem.id) {
      newItem.id = Date.now().toString()
      setItems([...getItems(), newItem])
    } else {
      const newList = getItems().slice()
      newList.splice(newList.findIndex(o => o.id == newItem.id), 1, newItem)
      setItems(newList)
    }
    itemForm.resetFields()
  };

  const handleDeleteItem = (id: string) => {
    setItems(getItems().slice().filter(o => o.id != id))
  };

  const handleSaveConfig = () => {
    if (config.items.length < 2) {
      Taro.showToast({title: '至少需要2个选项', icon: "none"});
      return;
    }
    dispatch(updateConfig(config))
    Taro.showToast({title: `保存成功~`});
  };

  const editItem = (item: RouletteItem) => {
    itemForm.setFieldsValue(item);
  }

  return (
    <View className='roulette-config'>
      <Form form={setForm}>
        <Form.Item label='合集名称'
                   align="center"
                   required
                   name="name"
                   initialValue={config.name}
                   rules={[
                     {required: true, message: '请输入合集名称'},
                   ]}
        >
          <Input
            placeholder='请输入合集名称'
            onChange={handleName}
            onBlur={handleName}
          />
        </Form.Item>
        <Form.Item label='描述信息'
                   align="center"
                   name="description"
                   initialValue={config.description}
        >
          <Input
            placeholder='请输入描述信息'
            onChange={handleDescription}
            onBlur={handleDescription}
          />
        </Form.Item>
      </Form>
      <Form
        form={itemForm}
        labelPosition="right"
        onFinish={handleUpdateItem}
        footer={
          <>
            <Button nativeType="submit" block type="primary">
              更新选项
            </Button>
          </>
        }>
        <Form.Item label='选项名称'
                   align="center"
                   required
                   name="name"
                   rules={[
                     {required: true, message: '请输入选项名称'},
                   ]}
        >
          <Input
            placeholder='请输入选项名称'
          />
        </Form.Item>
        <Form.Item label='选项颜色'
                   align="center"
          // required
                   name="color"
          // rules={[
          //   {required: true, message: '请选择颜色'},
          // ]}
        >
          <ColorPicker/>
        </Form.Item>
        <Form.Item label='指定概率'
                   align="center"
                   name="probability"
                   rules={[
                     {
                       message: "取值范围0~100",
                       validator: (
                         ruleCfg: FormItemRuleWithoutValidator,
                         value: number
                       ) => {
                         return !value || (value > 0 && value <= 100)
                       },
                     }
                   ]}>
          <Input
            type='number'
            placeholder='可选，默认平均概率'
          />
        </Form.Item>
      </Form>

      <View className='items-list'>
        {config?.items.map(item => (
          <View key={item.id} className='item'
                onClick={() => editItem(item)}
                style={{backgroundColor: item.color}}>
            <View className='item-content'>
              <View className='item-name' style={{color: !item.color && "#333333" || "#FFFFFF"}}>{item.name}</View>
              <View className='item-info'>
                {item.probability && (
                  <View className='item-probability'>权重: {item.probability}</View>
                )}
              </View>
            </View>
            <Button
              size='small'
              type='danger'
              onClick={() => handleDeleteItem(item.id)}
            >
              删除
            </Button>
          </View>
        ))}
      </View>

      {config.items.length > 0 && (
        <Button
          block
          type='primary'
          className='save-button'
          onClick={handleSaveConfig}
        >
          保存配置
        </Button>
      )}
    </View>
  );
};

export default RouletteConfigPage;
