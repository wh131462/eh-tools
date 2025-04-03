import Taro from '@tarojs/taro';

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本内容
 * @param t 翻译函数
 * @returns Promise<boolean> 复制是否成功
 */
export const copyToClipboard = async (text: string, t: (key: string) => string): Promise<boolean> => {
  try {
    await Taro.setClipboardData({
      data: text
    });
    await Taro.showToast({
      title: t("cryptoCopyResultTips"),
      icon: 'success',
      duration: 2000
    });
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    await Taro.showToast({
      title: `${t("copy")} ${t("failed")}!`,
      icon: 'error',
      duration: 2000
    });
    return false;
  }
};
