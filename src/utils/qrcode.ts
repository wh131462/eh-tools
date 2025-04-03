import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';

// 生成二维码（支持 UTF-8 中文）
export function generateQRCode(data: string): boolean[][] {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
  const qr = qrcode(0, 'M'); // 选择版本，'M' 级错误修正
  qr.addData(data); // 以字节方式存储
  qr.make();

  const moduleCount = qr.getModuleCount();
  const quietZone = 4;
  const totalSize = moduleCount + quietZone * 2;

  // 初始化矩阵，填充静默区
  const matrix: boolean[][] = Array.from({length: totalSize}, () =>
    Array(totalSize).fill(false)
  );

  // 填充二维码数据
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      matrix[y + quietZone][x + quietZone] = qr.isDark(y, x);
    }
  }
  return matrix;
}

// 解码二维码
export function decodeQRCode(data: Uint8ClampedArray, width: number, height: number): string {
  try {
    const code = jsQR(data, width, height);
    if (code) {
      return code.data
    }
    return '';
  } catch (error) {
    console.error('Decode error:', error);
    return '';
  }
}
