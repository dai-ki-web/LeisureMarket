// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
// 在数据库中查询用户是否存在
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const sheet = db.collection('users')
  let { data } = await sheet.where({
    _openid: _.eq(OPENID)
  }).get()
  return data.length ? data[0] : {}
}
