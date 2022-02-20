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
