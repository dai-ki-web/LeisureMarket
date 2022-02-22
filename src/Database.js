const db = wx.cloud.database()
const _ = db.command

export const dbAdd = (sheetName, data) => {
  const sheet = db.collection(sheetName)
  return sheet.add({ data })
}

export const dbSearchOpenid = (sheetName, data) => {
  const sheet = db.collection(sheetName)
  return sheet.where({ _openid: _.eq(data) }).get()
}

// 展示详情页时通过数据id向数据库查询数据
export const getGoodsData = (id) => {
  const sheet = db.collection('goods-shelf')
  return sheet.doc(id).get()
}
