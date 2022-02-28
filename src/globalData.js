
const userInfo = async () => {
  let info = await wx.getStorage({
    key: 'userInfo'
  }).then(res => {
    return res.data
  })
  return info
}

const cart = ['bf4a0bf26214af2110c2802c6157c674', '54ad1eea621c8936136f0528076ba158']
const cartTime = 0
export default {
  userInfo,
  cart,
  cartTime
}
