/**
 * 权限检查工具
 */

/**
 * 检查并请求保存图片权限
 */
export async function checkSaveImagePermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => resolve(true),
      fail: () => {
        uni.showModal({
          title: '权限提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  resolve(!!settingRes.authSetting['scope.writePhotosAlbum'])
                },
                fail: () => resolve(false)
              })
            } else {
              resolve(false)
            }
          }
        })
      }
    })
  })
}

/**
 * 检查相机权限
 */
export async function checkCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve(true),
      fail: () => {
        uni.showModal({
          title: '权限提示',
          content: '需要您授权使用相机',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  resolve(!!settingRes.authSetting['scope.camera'])
                },
                fail: () => resolve(false)
              })
            } else {
              resolve(false)
            }
          }
        })
      }
    })
  })
}
