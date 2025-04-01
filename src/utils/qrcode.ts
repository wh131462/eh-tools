const QR_VERSION = 2; // 版本2，21x21模块
const ERROR_CORRECTION_LEVEL: 'L' | 'M' | 'Q' | 'H' = 'M'; // 中等纠错级别

// 生成多项式表，用于纠错编码
const GENERATOR_POLYNOMIAL = {
  'L': [1, 87, 229, 146, 149, 238, 102, 21],
  'M': [1, 96, 198, 134, 86, 198, 89, 156, 156, 119],
  'Q': [1, 66, 67, 112, 195, 99, 213, 252, 238, 149, 102, 21],
  'H': [1, 89, 179, 131, 176, 182, 244, 157, 246, 238, 186, 85, 179]
};

// 字符集编码表
const CHAR_CODE_MAP = {
  NUMERIC: '0001',
  ALPHANUMERIC: '0010',
  BYTE: '0100'
};

// 掩码模式
const MASK_PATTERNS = [
  (i: number, j: number) => (i + j) % 2 === 0,
  (i: number, j: number) => i % 2 === 0,
  (i: number, j: number) => j % 3 === 0,
  (i: number, j: number) => (i + j) % 3 === 0,
  (i: number, j: number) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i: number, j: number) => (i * j) % 2 + (i * j) % 3 === 0,
  (i: number, j: number) => ((i * j) % 2 + (i * j) % 3) % 2 === 0,
  (i: number, j: number) => ((i * j) % 3 + (i + j) % 2) % 2 === 0
];

// 格式信息
const FORMAT_INFO = {
  'M': 0b101010000010010
};

// GF(256)域运算
const GF256 = {
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256),

  init() {
    let x = 1;
    for (let i = 0; i < 256; i++) {
      this.EXP_TABLE[i] = x;
      this.LOG_TABLE[x] = i;
      x = x << 1;
      if (x & 0x100) x ^= 0x11d;
    }
  },

  multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.EXP_TABLE[(this.LOG_TABLE[a] + this.LOG_TABLE[b]) % 255];
  }
};
GF256.init();

// 数据编码
function encodeData(data: string): string {
  const mode = CHAR_CODE_MAP.BYTE;
  const length = data.length.toString(2).padStart(8, '0');
  let bits = mode + length;

  for (let i = 0; i < data.length; i++) {
    bits += data.charCodeAt(i).toString(2).padStart(8, '0');
  }

  bits += '0000'; // 终止符
  const remainingBits = 8 - (bits.length % 8);
  if (remainingBits < 8) bits += '0'.repeat(remainingBits);

  // 版本2-M的数据容量为128位
  while (bits.length < 128) {
    bits += '11101100';
    if (bits.length < 128) bits += '00010001';
  }

  return bits.slice(0, 128);
}

// 生成纠错码字
function generateErrorCorrection(data: string): string {
  const polynomial = GENERATOR_POLYNOMIAL[ERROR_CORRECTION_LEVEL];
  const dataCoefficients: number[] = [];

  for (let i = 0; i < data.length; i += 8) {
    dataCoefficients.push(parseInt(data.substr(i, 8), 2));
  }

  const errorCoefficients = new Array(polynomial.length - 1).fill(0);

  for (const coeff of dataCoefficients) {
    const factor = coeff ^ errorCoefficients[0];
    errorCoefficients.shift();
    errorCoefficients.push(0);

    for (let j = 0; j < polynomial.length; j++) {
      errorCoefficients[j] ^= GF256.multiply(polynomial[j], factor);
    }
  }

  return errorCoefficients.map(c => c.toString(2).padStart(8, '0')).join('');
}

// 创建QR码矩阵
function createMatrix(data: string, errorCorrection: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({length: size}, () =>
    new Array(size).fill(false)
  );

  // 添加定位图案
  const addFinderPattern = (row: number, col: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        matrix[row + i][col + j] = (i === 0 || i === 6 || j === 0 || j === 6) ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4);
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, size - 7);
  addFinderPattern(size - 7, 0);

  // 添加定时图案
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = matrix[i][6] = (i % 2 === 0);
  }

  // 填充数据
  const allData = data + errorCorrection;
  let dataIndex = 0;

  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col--;

    for (let row = size - 1; row >= 0; row--) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (currentCol >= 0 && !isReservedModule(row, currentCol)) {
          if (dataIndex < allData.length) {
            matrix[row][currentCol] = allData[dataIndex] === '1';
            dataIndex++;
          }
        }
      }
    }
  }

  // 选择最佳掩码
  let bestScore = Infinity;
  let bestMask = 0;
  let bestMatrix = matrix;

  for (let mask = 0; mask < MASK_PATTERNS.length; mask++) {
    const testMatrix = matrix.map(row => [...row]);
    applyMask(testMatrix, mask);
    const score = evaluateMask(testMatrix);

    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
      bestMatrix = testMatrix;
    }
  }

  addFormatInfo(bestMatrix, bestMask);
  return bestMatrix;
}


function applyMask(matrix: boolean[][], maskPattern: number): void {
  const mask = MASK_PATTERNS[maskPattern];
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (!isReservedModule(i, j) && mask(i, j)) {
        matrix[i][j] = !matrix[i][j];
      }
    }
  }
}

function addFormatInfo(matrix: boolean[][], maskPattern: number): void {
  const format = FORMAT_INFO.M ^ (maskPattern << 10);
  const bits = format.toString(2).padStart(15, '0');

  // 水平方向
  for (let i = 0; i <= 6; i++) {
    matrix[8][i] = bits[14 - i] === '1';
  }
  matrix[8][7] = bits[8] === '1';
  matrix[8][8] = bits[7] === '1';
  matrix[7][8] = bits[6] === '1';

  // 垂直方向
  for (let i = 0; i <= 7; i++) {
    matrix[matrix.length - 1 - i][8] = bits[i] === '1';
  }
}

// 掩码评估
function evaluateMask(matrix: boolean[][]): number {
  let score = 0;
  const size = matrix.length;

  // 规则1: 连续模块
  for (let row = 0; row < size; row++) {
    let count = 1;
    for (let col = 1; col < size; col++) {
      matrix[row][col] === matrix[row][col - 1] ? count++ : (count = 1);
      if (count === 5) score += 3;
      else if (count > 5) score++;
    }
  }

  // 规则2: 2x2方块
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      if (matrix[row][col] === matrix[row + 1][col] &&
        matrix[row][col] === matrix[row][col + 1] &&
        matrix[row][col] === matrix[row + 1][col + 1]) {
        score += 3;
      }
    }
  }

  return score;
}

// 生成QR码
export function generateQRCode(data: string): boolean[][] {
  const encodedData = encodeData(data);
  const errorCorrection = generateErrorCorrection(encodedData);
  return createMatrix(encodedData, errorCorrection);
}

// 解码QR码主函数
export function decodeQRCode(matrix: boolean[][]): string {
  try {
    // 1. 检测掩码模式
    const maskPattern = detectMaskPattern(matrix);
    if (maskPattern === -1) throw new Error('Invalid mask pattern');

    // 2. 移除掩码
    const unmaskedMatrix = removeMask(matrix, maskPattern);

    // 3. 提取全部数据（包含纠错码）
    const dataBits = extractAllBits(unmaskedMatrix);

    // 4. 分离数据和纠错码
    const totalCodewords = 44; // 版本2-M的总码字数
    const dataCodewords = dataBits.slice(0, 128); // 数据部分
    const ecCodewords = dataBits.slice(128, 128 + 176); // 纠错部分

    // 5. 纠错验证
    if (!verifyErrorCorrection(dataCodewords + ecCodewords)) {
      throw new Error('Error correction failed');
    }

    // 6. 解析数据内容
    return parseData(dataCodewords);
  } catch (error) {
    console.error('Decode error:', error);
    return '';
  }
}

// 核心解码组件实现
const ALPHANUMERIC_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

// 检测掩码模式
function detectMaskPattern(matrix: boolean[][]): number {
  let formatBits = '';

  // 水平格式信息 (左上)
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) formatBits += matrix[8][i] ? '1' : '0';
  }

  // 垂直格式信息 (左下)
  for (let i = 7; i <= 14; i++) {
    formatBits += matrix[matrix.length - 15 + i][8] ? '1' : '0';
  }

  const formatInfo = parseInt(formatBits, 2) ^ 0b101010000010010;
  return (formatInfo >> 10) & 0x07;
}

// 移除掩码
function removeMask(matrix: boolean[][], maskPattern: number): boolean[][] {
  const size = matrix.length;
  const unmasked = matrix.map(row => [...row]);
  const maskFunc = MASK_PATTERNS[maskPattern];

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!isReservedModule(i, j) && maskFunc(i, j)) {
        unmasked[i][j] = !unmasked[i][j];
      }
    }
  }
  return unmasked;
}

// 提取所有数据位（蛇形读取顺序）
function extractAllBits(matrix: boolean[][]): string {
  const size = matrix.length;
  let bits = '';
  let direction = -1; // 读取方向：-1表示向上，1表示向下

  let col = size - 1;
  while (col > 0) {
    if (col === 6) col--; // 跳过定时图案列

    // 双列读取
    for (let row = (direction === 1) ? 0 : size - 1;
         row >= 0 && row < size;
         row += direction) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (currentCol >= 0 && !isReservedModule(row, currentCol)) {
          bits += matrix[row][currentCol] ? '1' : '0';
        }
      }
    }

    direction = -direction;
    col -= 2;
  }

  return bits;
}

// 验证纠错码
function verifyErrorCorrection(allBits: string): boolean {
  const codewords: number[] = [];
  for (let i = 0; i < allBits.length; i += 8) {
    codewords.push(parseInt(allBits.substr(i, 8), 2));
  }

  // 计算伴随式
  const syndrome = new Array(16).fill(0); // 版本2-M需要16个纠错码字
  for (let i = 0; i < syndrome.length; i++) {
    for (const cw of codewords) {
      syndrome[i] ^= GF256.multiply(cw, GF256.EXP_TABLE[i * codewords.length % 255]);
    }
  }

  return syndrome.every(s => s === 0);
}

// 解析数据内容
function parseData(dataBits: string): string {
  const mode = dataBits.substr(0, 4);
  let pointer = 4;

  // 解析数据长度
  let charCountBits = 8;
  if (mode === CHAR_CODE_MAP.NUMERIC) charCountBits = 10;
  if (mode === CHAR_CODE_MAP.ALPHANUMERIC) charCountBits = 9;

  const length = parseInt(dataBits.substr(pointer, charCountBits), 2);
  pointer += charCountBits;

  // 根据模式解码
  switch (mode) {
    case CHAR_CODE_MAP.NUMERIC:
      return parseNumeric(dataBits, pointer, length);

    case CHAR_CODE_MAP.ALPHANUMERIC:
      return parseAlphanumeric(dataBits, pointer, length);

    case CHAR_CODE_MAP.BYTE:
      return parseByte(dataBits, pointer, length);

    default:
      throw new Error('Unsupported encoding mode');
  }
}

// 数字模式解析
function parseNumeric(bits: string, start: number, length: number): string {
  let result = '';
  let pos = start;

  while (length > 0) {
    const chunkSize = Math.min(3, length);
    const value = parseInt(bits.substr(pos, chunkSize * 3 + 1), 2);
    result += value.toString().padStart(chunkSize, '0');
    pos += chunkSize * 3 + 1;
    length -= chunkSize;
  }

  return result;
}

// 字母数字模式解析
function parseAlphanumeric(bits: string, start: number, length: number): string {
  let result = '';
  let pos = start;

  for (let i = 0; i < length; i += 2) {
    const chunk = bits.substr(pos, 11);
    const value = parseInt(chunk, 2);

    result += ALPHANUMERIC_CHARS[Math.floor(value / 45)];
    if (i + 1 < length) {
      result += ALPHANUMERIC_CHARS[value % 45];
    }

    pos += 11;
  }

  return result;
}

// 字节模式解析
function parseByte(bits: string, start: number, length: number): string {
  let result = '';

  for (let i = 0; i < length; i++) {
    const byte = bits.substr(start + i * 8, 8);
    result += String.fromCharCode(parseInt(byte, 2));
  }

  return result;
}

// 保留模块判断（同生成器部分）
function isReservedModule(row: number, col: number): boolean {
  const size = 21;
  // 版本2的校准图案中心为(18,18)，覆盖16-20行列（5x5区域）
  const isAlignmentPattern = row >= 16 && row <= 20 && col >= 16 && col <= 20;
  return (
    (row < 7 && (col < 7 || col >= size - 7)) ||  // 定位图案
    (row >= size - 7 && col < 7) ||               // 左下定位
    row === 6 || col === 6 ||                     // 定时图案
    isAlignmentPattern                           // 精确校准图案区域
  );
}
