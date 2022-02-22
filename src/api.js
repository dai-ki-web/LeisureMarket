const db = wx.cloud.database()
const _ = db.command

export const dbAdd = (sheetName, data) => {
  const sheet = db.collection(sheetName)
  return sheet.add({ data })
}

// export const dbSearchOpenid = (sheetName, data) => {
//   const sheet = db.collection(sheetName)
//   return sheet.where({ _openid: _.eq(data) }).get()
// }

export const dbSearchUser = (openid) => {
  const sheet = db.collection('users')
  return sheet.where({ _openid: _.eq(openid) }).get()
}

// 展示详情页时通过数据id向数据库查询数据
export const getGoodsData = async (id) => {
  const sheet = db.collection('goods-shelf')
  // 用数据id换取数据
  let res = (await sheet.doc(id).get()).data
  const { openid } = res
  // 利用openid换取用户数据
  let user = (await dbSearchUser(openid)).data[0]
  const { avatarUrl, nickName } = user
  let publisherInfo = { avatarUrl, nickName }
  return { res, publisherInfo }
}

// 更新浏览量数据
export const updateView = (id, viewNow) => {
  db.collection('goods-shelf').doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      // 表示将 done 字段置为 true
      view: viewNow + 1
    }
  })
}

// 获取首页展示的所有数据
export const getAllGoods = () => {
  return db.collection('goods-shelf').get()
}
