import {Image, View} from '@tarojs/components'
import {useState} from 'react'
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro'
import {Button, Range, Tabs} from "@nutui/nutui-react-taro"
import {useTranslation} from '@/i18n'
import './index.less'
import {usePageTitle} from "@/hooks/usePageTitle";
import {useAppSelector} from "@/store/hooks";
import {checkSaveImagePermission} from "@/utils/permission";

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
  const {t} = useTranslation()
  usePageTitle("imageFilter")
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["imageFilter"]
  });
  useShareTimeline(() => {
    return shares["imageFilter"]
  });
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
    {name: t('original'), style: ''},
    {name: t('vintage'), style: 'sepia(100%)'},
    {name: t('blackAndWhite'), style: 'grayscale(100%)'},
    {name: t('invert'), style: 'invert(100%)'},
    {name: t('softLight'), style: 'opacity(80%) contrast(120%)'},
    {name: t('vivid'), style: 'saturate(200%)'}
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
        Taro.showToast({
          title: t('imageLoaded'),
          icon: 'success',
          duration: 1500
        })
      },
      fail: () => {
        Taro.showToast({
          title: t('imageLoadFailed'),
          icon: 'error',
          duration: 2000
        })
      }
    })
  }

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }))
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
    const hasPermission = await checkSaveImagePermission();
    if (!hasPermission) {
      Taro.showToast({
        title: t('saveFailed'),
        icon: 'error',
        duration: 2000
      });
      return;
    }
    if (!image) {
      Taro.showToast({
        title: t('pleaseChooseImage'),
        icon: 'error',
        duration: 2000
      })
      return
    }

    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: image.path
      })
      Taro.showToast({
        title: t('savedToAlbum'),
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      Taro.showToast({
        title: t('saveFailed'),
        icon: 'error',
        duration: 2000
      })
    }
  }

  return (
    <View className='image-filter'>
      <View className='upload-section'>
        <Button
          type='primary'
          onClick={handleChooseImage}
          className='ant-upload-btn'
        >
          + {t('chooseImage')}
        </Button>
        <View className='upload-tips'>{t('supportFormat')}, {t('maxSize')}</View>
      </View>

      {image && (
        <View className='image-section'>
          <View className='preview-card'>
            <Image
              src={image.path}
              mode='aspectFit'
              style={{
                filter: currentTab === 0
                  ? presetFilters[selectedPreset].style
                  : getCustomFilterStyle()
              }}
              className='preview-image'
              onClick={() => {
                Taro.previewImage({
                  current: image.path,
                  urls: [image.path]
                })
              }}
            />
          </View>

          <Tabs
            value={currentTab}
            onClick={setCurrentTab}
            className='ant-tabs'
            activeType='line'
          >
            <Tabs.TabPane title={t('presetFilters')} className='tab-pane'>
              <View className='preset-grid'>
                {presetFilters.map((filter, index) => (
                  <View
                    key={filter.name}
                    className={`preset-item ${selectedPreset === index ? 'active' : ''}`}
                    onClick={() => setSelectedPreset(index)}
                  >
                    <Image
                      src={image.path}
                      mode='aspectFill'
                      style={{filter: filter.style}}
                      className='preset-thumb'
                    />
                    <View className='preset-label'>{filter.name}</View>
                  </View>
                ))}
              </View>
            </Tabs.TabPane>

            <Tabs.TabPane title={t('customAdjust')} className='tab-pane'>
              <View className='filter-controls'>
                {Object.entries(filterValues).map(([key, value]) => (
                  <View key={key} className='control-item'>
                    <View className='control-label'>
                      {{
                        brightness: t('brightness'),
                        contrast: t('contrast'),
                        saturate: t('saturation'),
                        hueRotate: t('hue'),
                        blur: t('blur')
                      }[key]} ({value}{key === 'hueRotate' ? '°' : key === 'blur' ? 'px' : '%'})
                    </View>
                    <Range
                      value={value}
                      currentDescription={null}
                      min={key === 'hueRotate' ? 0 : 0}
                      max={key === 'hueRotate' ? 360 : key === 'blur' ? 10 : 200}
                      onChange={(v: any) => handleFilterChange(key as keyof FilterValues, v)}
                      className='ant-slider'
                    />
                  </View>
                ))}
              </View>
            </Tabs.TabPane>
          </Tabs>

          <Button
            type='primary'
            onClick={handleSave}
            className='ant-save-btn'
          >
            {t("exportImage")}
          </Button>
        </View>
      )}
    </View>
  )
}

export default ImageFilter
