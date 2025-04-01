import {Canvas, View} from '@tarojs/components'
import {Button, Input} from '@nutui/nutui-react-taro'
import {useEffect, useState} from 'react'
import {updatePageTitle} from '@/i18n/utils'
import {useAppSelector} from '@/store/hooks'
import {useTranslation} from '@/i18n'
import Taro from '@tarojs/taro'
import './index.less'
import {decodeQRCode, generateQRCode} from "@/utils/qrcode";

function QRCode() {
    const {language} = useAppSelector(state => state.app)
    const {t} = useTranslation()
    const [text, setText] = useState('')
    const [qrcode, setQrcode] = useState<boolean[][]>([[]])
    const [decodedResult, setDecodedResult] = useState('')

    useEffect(() => {
        updatePageTitle(language, 'qrcode')
    }, [language])

    // 生成二维码
    const handleGenerate = () => {
        if (!text) return
        const matrix = generateQRCode(text)
        setQrcode(matrix)
        drawQRCode(matrix)
    }

    // 在Canvas上绘制二维码
    const drawQRCode = (matrix: boolean[][]) => {
        const ctx = Taro.createCanvasContext('qrcode-canvas')
        if (!ctx) return

        const size = matrix.length
        const scale = Math.floor(210 / size) // 使用固定的canvas宽度210
        const padding = 2 // 添加内边距使模块之间有间隔

        // 清空画布
        ctx.setFillStyle('#FFFFFF')
        ctx.fillRect(0, 0, 210, 210)

        // 绘制二维码
        ctx.setFillStyle('#000000')
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (matrix[i][j]) {
                    // 判断是否是定位图案或校准图案的一部分
                    const isFinderPattern = (
                        (i < 7 && j < 7) || // 左上
                        (i < 7 && j > size - 8) || // 右上
                        (i > size - 8 && j < 7) // 左下
                    )
                    const isAlignmentPattern = (
                        i > size - 10 && i < size - 4 &&
                        j > size - 10 && j < size - 4
                    )

                    if (isFinderPattern || isAlignmentPattern) {
                        // 定位图案和校准图案使用圆角矩形
                        ctx.beginPath()
                        const radius = scale / 4
                        const x = j * scale + padding
                        const y = i * scale + padding
                        const width = scale - padding * 2
                        const height = scale - padding * 2

                        ctx.moveTo(x + radius, y)
                        ctx.lineTo(x + width - radius, y)
                        ctx.arcTo(x + width, y, x + width, y + radius, radius)
                        ctx.lineTo(x + width, y + height - radius)
                        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
                        ctx.lineTo(x + radius, y + height)
                        ctx.arcTo(x, y + height, x, y + height - radius, radius)
                        ctx.lineTo(x, y + radius)
                        ctx.arcTo(x, y, x + radius, y, radius)
                        ctx.closePath()
                        ctx.fill()
                    } else {
                        // 数据模块使用圆角矩形
                        ctx.beginPath()
                        const radius = scale / 6
                        const x = j * scale + padding
                        const y = i * scale + padding
                        const width = scale - padding * 2
                        const height = scale - padding * 2

                        ctx.moveTo(x + radius, y)
                        ctx.lineTo(x + width - radius, y)
                        ctx.arcTo(x + width, y, x + width, y + radius, radius)
                        ctx.lineTo(x + width, y + height - radius)
                        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
                        ctx.lineTo(x + radius, y + height)
                        ctx.arcTo(x, y + height, x, y + height - radius, radius)
                        ctx.lineTo(x, y + radius)
                        ctx.arcTo(x, y, x + radius, y, radius)
                        ctx.closePath()
                        ctx.fill()
                    }
                }
            }
        }

        ctx.draw()
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

            const data = res.data
            const size = 21 // QR码版本2的大小
            const scale = Math.floor(210 / size)
            const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false))

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const x = j * scale + Math.floor(scale / 2)
                    const y = i * scale + Math.floor(scale / 2)
                    const idx = (y * 210 + x) * 4
                    const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
                    matrix[i][j] = gray < 128
                }
            }

            const decodedText = decodeQRCode(matrix)
            setDecodedResult(decodedText)
        } catch (error) {
            console.error('Failed to decode QR code:', error)
        }
    }

    return (
        <View className='qrcode-page'>
            <View className='input-section'>
                <Input
                    className='text-input'
                    value={text}
                    onChange={value => setText(value)}
                    placeholder={t('enterText')}
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
