import {Canvas, View} from '@tarojs/components'
import {Button, Tabs, TextArea} from '@nutui/nutui-react-taro'
import {useState} from 'react'
import {useTranslation} from '@/i18n'
import {decodeQRCode, generateQRCode} from "@/utils/qrcode";
import {usePageTitle} from "@/hooks/usePageTitle";
import Taro, {useShareAppMessage, useShareTimeline} from '@tarojs/taro'
import './index.less'
import {useAppSelector} from "@/store/hooks";
import {checkSaveImagePermission} from '@/utils/permission';

function QRCode() {
  const {t} = useTranslation()
  const [text, setText] = useState('')
  const [generateResult, setGenerateResult] = useState('')
  const [scanResult, setScanResult] = useState('')
  const {shares} = useAppSelector(state => state.app);
  useShareAppMessage(() => {
    return shares["qrcode"]
  });
  useShareTimeline(() => {
    return shares["qrcode"]
  });
  usePageTitle("qrcode")

  // 生成二维码
  const handleGenerate = () => {
    if (!text) {
      Taro.showToast({
        title: t('pleaseInput') + t('enterText'),
        icon: 'none',
        duration: 2000
      })
      return
    }
    try {
      const matrix = generateQRCode(text)
      drawGenerateQRCode(matrix)
      setGenerateResult(text)
      Taro.showToast({
        title: t('success'),
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('Generate QR code failed:', error)
      Taro.showToast({
        title: t('failed'),
        icon: 'error',
        duration: 2000
      })
    }
  }

  // 在生成Canvas上绘制二维码
  const drawGenerateQRCode = (matrix: boolean[][]) => {
    const ctx = Taro.createCanvasContext('generate-canvas');
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

  // 在扫描Canvas上绘制二维码
  const drawScanQRCode = (matrix: boolean[][]) => {
    const ctx = Taro.createCanvasContext('scan-canvas');
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

  // 验证生成的二维码
  const handleVerifyGenerate = async () => {
    if (!generateResult) {
      Taro.showToast({
        title: t('pleaseInput') + t('enterText'),
        icon: 'none',
        duration: 2000
      })
      return
    }
    try {
      const res = await Taro.canvasGetImageData({
        canvasId: 'generate-canvas',
        x: 0,
        y: 0,
        width: 210,
        height: 210
      })

      const decodedText = decodeQRCode(res.data, 210, 210)
      if (!decodedText) {
        throw new Error('Decode failed')
      }
      setGenerateResult(decodedText)
      Taro.showToast({
        title: t('success'),
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('Failed to decode QR code:', error)
      Taro.showToast({
        title: t('decodeFailed'),
        icon: 'error',
        duration: 2000
      })
    }
  }

  const [activeTab, setActiveTab] = useState(0)
  return (
    <View className='qrcode-page'>
      <Tabs
        value={activeTab}
        className='qrcode-tabs'
        activeType='line'
        onChange={(value: number) => setActiveTab(value)}
      >
        <Tabs.TabPane title={t('generate')} className='tab-pane'>
          <View className='content-section'>
            <View className='input-section'>
              <TextArea
                className='text-input'
                value={text}
                onChange={value => setText(value)}
                placeholder={t('enterText')}
                rows={3}
              />
              <Button type='primary' onClick={handleGenerate}>
                {t('generate')}
              </Button>
            </View>

            <View className='canvas-section'>
              <Canvas
                canvasId="generate-canvas"
                style={{
                  width: '210px',
                  height: '210px',
                  backgroundColor: '#FFFFFF'
                }}
              />
            </View>

            <View className='action-buttons'>
              <Button onClick={async () => {
                const hasPermission = await checkSaveImagePermission();
                if (!hasPermission) {
                  Taro.showToast({
                    title: t('saveFailed'),
                    icon: 'error',
                    duration: 2000
                  });
                  return;
                }
                Taro.canvasToTempFilePath({
                  canvasId: 'generate-canvas',
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
              }}>
                {t('save')}
              </Button>
              <Button onClick={handleVerifyGenerate}>{t('verify')}</Button>
            </View>

            {generateResult && (
              <View className='result-section'>
                <View className='result-text'>{generateResult}</View>
                <Button
                  block={true}
                  onClick={() => {
                    Taro.setClipboardData({
                      data: generateResult,
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
        </Tabs.TabPane>

        <Tabs.TabPane title={t('scan')} className='tab-pane'>
          <View className='content-section'>
            <View className='canvas-section'>
              <Canvas
                canvasId="scan-canvas"
                style={{
                  width: '210px',
                  height: '210px',
                  backgroundColor: '#FFFFFF'
                }}
              />
            </View>
            <View className='scan-buttons'>
              <Button onClick={async () => {
                try {
                  const res = await Taro.scanCode({
                    onlyFromCamera: true,
                    scanType: ['qrCode']
                  })
                  setText(res.result)
                  setScanResult(res.result)
                  const matrix = generateQRCode(res.result)
                  drawScanQRCode(matrix)
                } catch (error: any) {
                  console.error('扫码失败:', error)
                  let errorMsg = t('scanFailed')
                  if (error.errMsg) {
                    if (error.errMsg.includes('cancel')) {
                      errorMsg = t('userCanceled')
                    } else if (error.errMsg.includes('permission')) {
                      errorMsg = t('cameraPermissionDenied')
                    }
                  }
                  Taro.showToast({
                    title: errorMsg,
                    icon: 'error',
                    duration: 2000
                  })
                }
              }}>{t('scanFromCamera')}</Button>
              <Button onClick={async () => {
                try {
                  const res = await Taro.chooseImage({
                    count: 1,
                    sourceType: ['album']
                  })
                  const canvas = Taro.createCanvasContext('scan-canvas')
                  canvas.drawImage(res.tempFilePaths[0], 0, 0, 210, 210)
                  canvas.draw(false, async () => {
                    try {
                      const data = await Taro.canvasGetImageData({
                        canvasId: 'scan-canvas',
                        x: 0,
                        y: 0,
                        width: 210,
                        height: 210
                      })
                      const decodedText = decodeQRCode(data.data, 210, 210)
                      if (!decodedText) {
                        throw new Error('No QR code found')
                      }
                      setText(decodedText)
                      setScanResult(decodedText)
                      const matrix = generateQRCode(decodedText)
                      drawScanQRCode(matrix)
                    } catch (error) {
                      console.error('解码失败:', error)
                      Taro.showToast({
                        title: t('noQRCodeFound'),
                        icon: 'error',
                        duration: 2000
                      })
                    }
                  })
                } catch (error: any) {
                  console.error('选择图片失败:', error)
                  let errorMsg = t('chooseImageFailed')
                  if (error.errMsg) {
                    if (error.errMsg.includes('cancel')) {
                      errorMsg = t('userCanceled')
                    } else if (error.errMsg.includes('permission')) {
                      errorMsg = t('albumPermissionDenied')
                    }
                  }
                  Taro.showToast({
                    title: errorMsg,
                    icon: 'error',
                    duration: 2000
                  })
                }
              }}>{t('scanFromAlbum')}</Button>
            </View>

            {scanResult && (
              <View className='result-section'>
                <View className='result-text'>{scanResult}</View>
                <Button
                  block={true}
                  onClick={() => {
                    Taro.setClipboardData({
                      data: scanResult,
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
        </Tabs.TabPane>
      </Tabs>
    </View>
  )
}

export default QRCode
