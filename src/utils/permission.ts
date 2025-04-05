import Taro from '@tarojs/taro';

export const checkSaveImagePermission = async (): Promise<boolean> => {
  try {
    const res = await Taro.getSetting();
    if (!res.authSetting['scope.writePhotosAlbum']) {
      // 如果未授权，引导用户去设置页面开启权限
      await Taro.showModal({
        title: '提示',
        content: '需要您授权保存图片到相册的权限',
        confirmText: '去设置',
        cancelText: '取消'
      }).then(async (modalRes) => {
        if (modalRes.confirm) {
          await Taro.openSetting();
        }
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
};