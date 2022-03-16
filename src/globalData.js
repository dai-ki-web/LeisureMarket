
const userInfo = async () => {
  let info = await wx.getStorage({
    key: 'userInfo'
  }).then(res => {
    return res.data
  })
  return info
}

const cart = []
const cartTime = 0
export default {
  userInfo,
  cart,
  cartTime
}
