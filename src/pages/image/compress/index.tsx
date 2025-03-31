import {Image, Slider, View} from '@tarojs/components'
import {useState} from 'react'
import Taro from '@tarojs/taro'
import {Button} from "@nutui/nutui-react-taro";

interface ImageInfo {
  path: string
  size: number
  compressedPath?: string
  compressedSize?: number
}

const ImageCompressor = () => {
  const [image, setImage] = useState<ImageInfo | null>(null)
  const [quality, setQuality] = useState(80)

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

  const handleCompress = async () => {
    if (!image) {
      Taro.showToast({
        title: '请先选择图片',
        icon: 'error'
      })
      return
    }

    try {
      const res = await Taro.compressImage({
        src: image.path,
        quality
      })

      const fileInfo = await Taro.getFileInfo({filePath: res.tempFilePath})

      setImage({
        ...image,
        compressedPath: res.tempFilePath,
        compressedSize: (fileInfo as any).size
      })

      Taro.showToast({
        title: '压缩成功',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '压缩失败',
        icon: 'error'
      })
    }
  }

  const handleSave = async () => {
    if (!image?.compressedPath) {
      Taro.showToast({
        title: '请先压缩图片',
        icon: 'error'
      })
      return
    }

    try {
      await Taro.saveImageToPhotosAlbum({
        filePath: image.compressedPath
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
    <View className='image-compressor'>
      <View className='upload-section'>
        <Button type='primary' onClick={handleChooseImage}>
          选择图片
        </Button>
      </View>

      {image && (
        <View className='image-section'>
          <View className='image-preview'>
            <View className='preview-item'>
              <View className='preview-title'>原图</View>
              <Image src={image.path} mode='aspectFit'/>
              <View className='preview-size'>大小：{formatSize(image.size)}</View>
            </View>
            {image.compressedPath && (
              <View className='preview-item'>
                <View className='preview-title'>压缩后</View>
                <Image src={image.compressedPath} mode='aspectFit'/>
                <View className='preview-size'>
                  大小：{formatSize(image.compressedSize!)}
                  <View className='compression-ratio'>
                    压缩率：{((1 - image.compressedSize! / image.size) * 100).toFixed(1)}%
                  </View>
                </View>
              </View>
            )}
          </View>

          <View className='compress-controls'>
            <View className='quality-slider'>
              <View className='slider-title'>压缩质量：{quality}%</View>
              <Slider
                value={quality}
                min={1}
                max={100}
                onChange={(event) => setQuality(event.detail.value)}
              />
            </View>
            <View className='button-group'>
              <Button onClick={handleCompress}>压缩</Button>
              {image.compressedPath && (
                <Button type='primary' onClick={handleSave}>保存</Button>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ImageCompressor
