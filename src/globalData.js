
const userInfo = () => {
  let info
  wx.getStorage({
    key: 'userInfo',
    success: res => {
      info = res
    }
  })
  return info
}

export default {
  userInfo
}
