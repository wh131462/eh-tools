import {Image, View} from '@tarojs/components'
import {useState} from 'react'
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro'
import {Button, Range} from "@nutui/nutui-react-taro"
import "./index.less"
import {useTranslation} from "@/i18n";
import {usePageTitle} from "@/hooks/usePageTitle";
import {useAppSelector} from "@/store/hooks";

interface ImageInfo {
  path: string
  size: number
  compressedPath?: string
  compressedSize?: number
  id: string
}

const ImageCompressor = () => {
  const {t} = useTranslation()
  usePageTitle("imageCompressor")
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["imageCompressor"]
  });
  useShareTimeline(() => {
    return shares["imageCompressor"]
  });
  const [images, setImages] = useState<ImageInfo[]>([])
  const [quality, setQuality] = useState(80)

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9,
      sourceType: ['album'],
      success: async (res) => {
        const newImages = await Promise.all(
          res.tempFilePaths.map(async (path) => {
            const fileInfo = await Taro.getFileInfo({filePath: path})
            return {
              path,
              size: (fileInfo as any).size,
              id: Math.random().toString(36).substring(2)
            }
          })
        )
        setImages(prev => [...prev, ...newImages])
      }
    })
  }

  const handleCompress = async () => {
    if (images.length === 0) {
      Taro.showToast({
        title: t('pleaseChooseImage'),
        icon: 'error',
        duration: 2000
      })
      return
    }

    try {
      const compressedImages = await Promise.all(
        images.map(async (image) => {
          if (image.compressedPath) return image

          const res = await Taro.compressImage({
            src: image.path,
            quality
          })

          const fileInfo = await Taro.getFileInfo({filePath: res.tempFilePath})

          return {
            ...image,
            compressedPath: res.tempFilePath,
            compressedSize: (fileInfo as any).size
          }
        })
      )

      setImages(compressedImages)

      Taro.showToast({
        title: t('compressComplete'),
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      Taro.showToast({
        title: t('compressFailed'),
        icon: 'error',
        duration: 2000
      })
    }
  }

  const handleSave = async () => {
    const compressedImages = images.filter(img => img.compressedPath)
    if (compressedImages.length === 0) {
      Taro.showToast({
        title: t('pleaseCompressFirst'),
        icon: 'error',
        duration: 2000
      })
      return
    }

    try {
      await Promise.all(
        compressedImages.map(image =>
          Taro.saveImageToPhotosAlbum({
            filePath: image.compressedPath!
          })
        )
      )
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

  const formatSize = (size: number) => {
    if (size < 1024) return size + 'B'
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  }

  const handleRemoveImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <View className='image-compressor'>
      <View className='upload-section'>
        <View className='upload-area' onClick={handleChooseImage}>
          <View className='upload-hint'>{t('addImage')}</View>
          <View className='upload-sub-hint'>{t('supportFormat')}</View>
        </View>
      </View>

      {images.length > 0 && (
        <View className='image-section'>
          <View className='image-preview'>
            {images.map(image => (
              <View key={image.id} className='preview-item'>
                <View className='preview-header'>
                  <View className='preview-title'>{t('originalImage')}</View>
                  <View
                    className='preview-close'
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    ×
                  </View>
                </View>
                <Image src={image.path} mode='aspectFit' onClick={() => {
                  Taro.previewImage({
                    current: image.path,
                    urls: [image.path]
                  })
                }}/>
                <View className='preview-size'>{t('size')}: {formatSize(image.size)}</View>

                {image.compressedPath && (
                  <View className='compressed-preview'>
                    <Image src={image.compressedPath} mode='aspectFit' onClick={() => {
                      Taro.previewImage({
                        current: image.compressedPath!,
                        urls: [image.compressedPath!]
                      })
                    }}/>
                    <View className='preview-info'>
                      <View className='preview-size'>
                        {t('compressedImage')}: {formatSize(image.compressedSize!)}
                        <Button size='small' onClick={() => {
                          Taro.saveImageToPhotosAlbum({
                            filePath: image.compressedPath!,
                            success: () => {
                              Taro.showToast({
                                title: t('success'),
                                icon: 'success',
                                duration: 2000
                              })
                            },
                            fail: () => {
                              Taro.showToast({
                                title: t('saveFailed'),
                                icon: 'error',
                                duration: 2000
                              })
                            }
                          })
                        }}>{t('save')}</Button>
                      </View>
                      <View className='compression-ratio'>
                        {image.compressedSize! < image.size ? (
                          <>{t('compressionRatio')} {((1 - image.compressedSize! / image.size) * 100).toFixed(1)}%</>
                        ) : (
                          <>{t('bestQuality')}</>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View className='compress-controls'>
            <View className='quality-slider'>
              <View className='slider-title'>
                <span>{t('quality')}: </span>
                <span>{quality}%</span>
              </View>
              <Range
                value={quality}
                min={1}
                max={100}
                currentDescription={null}
                onChange={(event: any) => setQuality(event)}
                className='ant-slider'
              />
            </View>
            <View className='button-group'>
              <Button onClick={handleCompress}>{t('startCompress')}</Button>
              {images.some(img => img.compressedPath) && (
                <Button type='primary' onClick={handleSave}>{t('saveAll')}</Button>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ImageCompressor
