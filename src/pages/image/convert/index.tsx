import {Image, View} from '@tarojs/components'
import {useState} from 'react'
import Taro from '@tarojs/taro'
import {Button, Picker} from "@nutui/nutui-react-taro";

interface ImageInfo {
  path: string
  size: number
  type: string
  convertedPath?: string
  convertedSize?: number
}

const ImageConverter = () => {
  const [image, setImage] = useState<ImageInfo | null>(null)
  const [targetFormat, setTargetFormat] = useState('jpg')

  const formatOptions = [
    {label: 'JPG', value: 'jpg'},
    {label: 'PNG', value: 'png'},
    {label: 'WEBP', value: 'webp'}
  ]

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sourceType: ['album'],
      success: async (res) => {
        const fileInfo = await Taro.getFileInfo({filePath: res.tempFilePaths[0]})
        const type = res.tempFilePaths[0].split('.').pop()?.toLowerCase() || ''
        setImage({
          path: res.tempFilePaths[0],
          size: (fileInfo as any).size,
          type
        })
      }
    })
  }

  const handleConvert = async () => {
    if (!image) {
      Taro.showToast({
        title: '请先选择图片',
        icon: 'error'
      })
      return
    }

    if (image.type === targetFormat) {
      Taro.showToast({
        title: '目标格式与原格式相同',
        icon: 'error'
      })
      return
    }

    try {
      // 在小程序中，我们使用压缩API来模拟格式转换
      const res = await Taro.compressImage({
        src: image.path,
        quality: 95,
        compressedWidth: 2000, // 保持较高分辨率
        compressedHeight: 2000
      })

      const fileInfo = await Taro.getFileInfo({filePath: res.tempFilePath})

      setImage({
        ...image,
        convertedPath: res.tempFilePath,
        convertedSize: (fileInfo as any).size
      })

      Taro.showToast({
        title: '转换成功',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '转换失败',
        icon: 'error'
      })
    }
  }

  const handleSave = async () => {
    if (!image?.convertedPath) {
      Taro.showToast({
        title: '请先转换图片',
        icon: 'error'
      })
      return
    }

    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: image.convertedPath
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

  const formatSize = (size: number) => {
    if (size < 1024) return size + 'B'
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  }

  return (
    <View className='image-converter'>
      <View className='upload-section'>
        <Button type='primary' onClick={handleChooseImage}>
          选择图片
        </Button>
      </View>

      {image && (
        <View className='image-section'>
          <View className='image-preview'>
            <View className='preview-item'>
              <View className='preview-title'>原图 ({image.type.toUpperCase()})</View>
              <Image src={image.path} mode='aspectFit'/>
              <View className='preview-size'>大小：{formatSize(image.size)}</View>
            </View>
            {image.convertedPath && (
              <View className='preview-item'>
                <View className='preview-title'>转换后 ({targetFormat.toUpperCase()})</View>
                <Image src={image.convertedPath} mode='aspectFit'/>
                <View className='preview-size'>
                  大小：{formatSize(image.convertedSize!)}
                </View>
              </View>
            )}
          </View>

          <View className='convert-controls'>
            <View className='format-selector'>
              <View className='selector-title'>目标格式</View>
              <Picker
                children={formatOptions}
                value={[targetFormat]}
                onChange={(event) => setTargetFormat(event[0].value as any)}
              />
            </View>
            <View className='button-group'>
              <Button onClick={handleConvert}>转换</Button>
              {image.convertedPath && (
                <Button type='primary' onClick={handleSave}>保存</Button>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ImageConverter
