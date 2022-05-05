
const userInfo = async () => {
  let info = await wx.getStorage({
    key: 'userInfo'
  }).then(res => {
    return res.data
  })
  return info
}

const userAuth = async () => {
  let info = await wx.getStorage({
    key: 'userAuth'
  }).then(res => {
    return res.data
  }).catch(err => {
    return false
  })
  return info
}

const cart = []
const cartTime = 0
export default {
  userInfo,
  userAuth,
  cart,
  cartTime
}
