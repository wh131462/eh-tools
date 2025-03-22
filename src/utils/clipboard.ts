import Taro from '@tarojs/taro';

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本内容
 * @returns Promise<boolean> 复制是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Taro.setClipboardData({
      data: text
    });
    await Taro.showToast({
      title: '复制成功',
      icon: 'success',
      duration: 2000
    });
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    await Taro.showToast({
      title: '复制失败',
      icon: 'error',
      duration: 2000
    });
    return false;
  }
};