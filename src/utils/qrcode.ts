import jsQR from 'jsqr';
import qrcode from 'qrcode-generator';

// 生成逻辑修正版
export function generateQRCode(data: string): boolean[][] {
    const qr = qrcode(0, 'H'); // 使用自动版本选择(0)和最高纠错级别(H)
    qr.setUtf8(true); // 启用UTF-8编码
    qr.addData(data);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const quietZone = 4;
    const totalSize = moduleCount + quietZone * 2;

    // 初始化静默区矩阵
    const matrix: boolean[][] = Array.from({length: totalSize}, () =>
        Array(totalSize).fill(false)
    );

    // 填充数据（注意行列坐标系差异）
    for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
            matrix[y + quietZone][x + quietZone] = qr.isDark(y, x);
        }
    }
    return matrix;
}


// 解码QR码
export function decodeQRCode(data, width, height): string {
    try {
        const code = jsQR(data, width, height);
        return code ? code.data : '';
    } catch (error) {
        console.error('Decode error:', error);
        return '';
    }
}
