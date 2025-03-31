import {Image, Slider, View} from '@tarojs/components'
import {useState} from 'react'
import Taro from '@tarojs/taro'
import {Button, Tabs} from "@nutui/nutui-react-taro";

interface ImageInfo {
  path: string
  size: number
}

interface FilterValues {
  brightness: number
  contrast: number
  saturate: number
  hueRotate: number
  blur: number
}

const ImageFilter = () => {
  const [image, setImage] = useState<ImageInfo | null>(null)
  const [currentTab, setCurrentTab] = useState<string | number>(0)
  const [filterValues, setFilterValues] = useState<FilterValues>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hueRotate: 0,
    blur: 0
  })

  const presetFilters = [
    {name: '原图', style: ''},
    {name: '怀旧', style: 'sepia(100%)'},
    {name: '黑白', style: 'grayscale(100%)'},
    {name: '反色', style: 'invert(100%)'},
    {name: '褪色', style: 'opacity(50%)'},
    {name: '高饱和', style: 'saturate(200%)'}
  ]

  const [selectedPreset, setSelectedPreset] = useState(0)

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: async (res) => {
        const fileInfo = await Taro.getFileInfo({filePath: res.tempFilePaths[0]})
        setImage({
          path: res.tempFilePaths[0],
          size: (fileInfo as any).size
        })
      }
    })
  }

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }))
    // 切换到自定义滤镜时重置预设选择
    setSelectedPreset(0)
  }

  const getCustomFilterStyle = () => {
    return `brightness(${filterValues.brightness}%)
            contrast(${filterValues.contrast}%)
            saturate(${filterValues.saturate}%)
            hue-rotate(${filterValues.hueRotate}deg)
            blur(${filterValues.blur}px)`
  }

  const handleSave = async () => {
    if (!image) {
      Taro.showToast({
        title: '请先选择图片',
        icon: 'error'
      })
      return
    }

    try {
      // 由于小程序环境限制，我们只能保存原图
      await Taro.saveImageToPhotosAlbum({
        filePath: image.path
      })
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  }


  return (
    <View className='image-filter'>
      <View className='upload-section'>
        <Button type='primary' onClick={handleChooseImage}>
          选择图片
        </Button>
      </View>

      {image && (
        <View className='image-section'>
          <View className='image-preview'>
            <Image
              src={image.path}
              mode='aspectFit'
              style={{
                filter: currentTab === 0
                  ? presetFilters[selectedPreset].style
                  : getCustomFilterStyle()
              }}
            />
          </View>

          <Tabs
            value={currentTab}
            onClick={setCurrentTab}
          >
            <Tabs.TabPane title="预设滤镜">
              <View className='preset-filters'>
                {presetFilters.map((filter, index) => (
                  <View
                    key={filter.name}
                    className={`filter-item ${selectedPreset === index ? 'active' : ''}`}
                    onClick={() => setSelectedPreset(index)}
                  >
                    <Image
                      src={image.path}
                      mode='aspectFill'
                      style={{filter: filter.style}}
                    />
                    <View className='filter-name'>{filter.name}</View>
                  </View>
                ))}
              </View>
            </Tabs.TabPane>

            <Tabs.TabPane title="自定义滤镜">
              <View className='custom-filters'>
                <View className='filter-item'>
                  <View className='filter-label'>亮度 ({filterValues.brightness}%)</View>
                  <Slider
                    value={filterValues.brightness}
                    min={0}
                    max={200}
                    onChange={value => handleFilterChange('brightness', value)}
                  />
                </View>
                <View className='filter-item'>
                  <View className='filter-label'>对比度 ({filterValues.contrast}%)</View>
                  <Slider
                    value={filterValues.contrast}
                    min={0}
                    max={200}
                    onChange={value => handleFilterChange('contrast', value)}
                  />
                </View>
                <View className='filter-item'>
                  <View className='filter-label'>饱和度 ({filterValues.saturate}%)</View>
                  <Slider
                    value={filterValues.saturate}
                    min={0}
                    max={200}
                    onChange={value => handleFilterChange('saturate', value)}
                  />
                </View>
                <View className='filter-item'>
                  <View className='filter-label'>色相旋转 ({filterValues.hueRotate}°)</View>
                  <Slider
                    value={filterValues.hueRotate}
                    min={0}
                    max={360}
                    onChange={value => handleFilterChange('hueRotate', value)}
                  />
                </View>
                <View className='filter-item'>
                  <View className='filter-label'>模糊 ({filterValues.blur}px)</View>
                  <Slider
                    value={filterValues.blur}
                    min={0}
                    max={10}
                    onChange={value => handleFilterChange('blur', value)}
                  />
                </View>
              </View>
            </Tabs.TabPane>
          </Tabs>

          <View className='button-group'>
            <Button type='primary' onClick={handleSave}>保存</Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default ImageFilter
