import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Algorithm = 'base64' | 'aes' | 'des'

interface CryptoState {
  text: string
  result: string
  algorithm: Algorithm
  key: string
  mode: 'encrypt' | 'decrypt'
}

const initialState: CryptoState = {
  text: '',
  result: '',
  algorithm: 'base64',
  key: '',
  mode: 'encrypt'
}

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    setText: (state, action: PayloadAction<string>) => {
      state.text = action.payload
    },
    setResult: (state, action: PayloadAction<string>) => {
      state.result = action.payload
    },
    setAlgorithm: (state, action: PayloadAction<Algorithm>) => {
      state.algorithm = action.payload
      // 重置密钥，因为不同算法可能需要不同长度的密钥
      state.key = ''
    },
    setKey: (state, action: PayloadAction<string>) => {
      state.key = action.payload
    },
    setMode: (state, action: PayloadAction<'encrypt' | 'decrypt'>) => {
      state.mode = action.payload
    },
    resetCrypto: (state) => {
      state.text = ''
      state.result = ''
      state.key = ''
    }
  }
})

export const { setText, setResult, setAlgorithm, setKey, setMode, resetCrypto } = cryptoSlice.actions
export default cryptoSlice.reducer