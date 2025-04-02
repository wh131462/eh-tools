import {Canvas, View} from '@tarojs/components'
import {Button, TextArea} from '@nutui/nutui-react-taro'
import {useState} from 'react'
import {useTranslation} from '@/i18n'
import {decodeQRCode, generateQRCode} from "@/utils/qrcode";
import {usePageTitle} from "@/hooks/usePageTitle";
import Taro from '@tarojs/taro'
import './index.less'

function QRCode() {
  const {t} = useTranslation()
  const [text, setText] = useState('')
  const [qrcode, setQrcode] = useState<boolean[][]>([[]])
  const [decodedResult, setDecodedResult] = useState('')

  usePageTitle("qrcode")

  // 生成二维码
  const handleGenerate = () => {
    if (!text) return
    const matrix = generateQRCode(text)
    setQrcode(matrix)
    drawQRCode(matrix)
  }

// 在Canvas上绘制二维码（优化版）
  const drawQRCode = (matrix: boolean[][]) => {
    const ctx = Taro.createCanvasContext('qrcode-canvas');
    const size = matrix.length;
    const scale = 210 / size;

    // 绘制背景
    ctx.setFillStyle('#FFFFFF');
    ctx.fillRect(0, 0, 210, 210);

    // 绘制模块（暂时使用直角）
    ctx.setFillStyle('#000000');
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (matrix[y][x]) {
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    ctx.draw();
  }
  // 扫描二维码
  const handleScan = async () => {
    try {
      const res = await Taro.canvasGetImageData({
        canvasId: 'qrcode-canvas',
        x: 0,
        y: 0,
        width: 210,
        height: 210
      })

      const decodedText = decodeQRCode(res.data, 210, 210)
      setDecodedResult(decodedText)
    } catch (error) {
      console.error('Failed to decode QR code:', error)
    }
  }

  return (
    <View className='qrcode-page'>
      <View className='input-section'>
        <TextArea
          className='text-input'
          value={text}
          onChange={value => setText(value)}
          placeholder={t('enterText')}
          rows={3}
          autoSize={{
            minHeight: 50,
            maxHeight: 100
          }}
        />
        <Button type='primary' onClick={handleGenerate}>
          {t('generate')}
        </Button>
      </View>

      <View className='canvas-section'>
        <Canvas
          canvasId="qrcode-canvas"
          style={{
            width: '210px',
            height: '210px',
            backgroundColor: '#FFFFFF'
          }}
        />
      </View>

      <View className='scan-section'>
        <Button onClick={handleScan}>{t('scan')}</Button>
        <Button
          onClick={() => {
            Taro.canvasToTempFilePath({
              canvasId: 'qrcode-canvas',
              success: function (res) {
                Taro.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function () {
                    Taro.showToast({
                      title: t('saveSuccess'),
                      icon: 'success',
                      duration: 2000
                    })
                  },
                  fail: function () {
                    Taro.showToast({
                      title: t('saveFailed'),
                      icon: 'error',
                      duration: 2000
                    })
                  }
                })
              }
            })
          }}
        >
          {t('save')}
        </Button>
      </View>

      {decodedResult && (
        <View className='result-section'>
          <View className='result-text'>{decodedResult}</View>
          <Button
            onClick={() => {
              Taro.setClipboardData({
                data: decodedResult,
                success: () => {
                  Taro.showToast({
                    title: t('copySuccess'),
                    icon: 'success',
                    duration: 2000
                  })
                }
              })
            }}
          >
            {t('copy')}
          </Button>
        </View>
      )}
    </View>
  )
}

export default QRCode
