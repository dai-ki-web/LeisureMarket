
const userInfo = async () => {
  let info = await wx.getStorage({
    key: 'userInfo'
  }).then(res => {
    return res.data
  })
  return info
}

export default {
  userInfo
}
