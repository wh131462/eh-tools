import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface QRCodeState {
  content: string
  generatedCode: string
  scannedCode: string
  mode: 'generate' | 'scan'
}

const initialState: QRCodeState = {
  content: '',
  generatedCode: '',
  scannedCode: '',
  mode: 'generate'
}

const qrcodeSlice = createSlice({
  name: 'qrcode',
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload
    },
    setGeneratedCode: (state, action: PayloadAction<string>) => {
      state.generatedCode = action.payload
    },
    setScannedCode: (state, action: PayloadAction<string>) => {
      state.scannedCode = action.payload
    },
    setMode: (state, action: PayloadAction<'generate' | 'scan'>) => {
      state.mode = action.payload
    },
    resetQRCode: (state) => {
      state.content = ''
      state.generatedCode = ''
      state.scannedCode = ''
    }
  }
})

export const { setContent, setGeneratedCode, setScannedCode, setMode, resetQRCode } = qrcodeSlice.actions
export default qrcodeSlice.reducer