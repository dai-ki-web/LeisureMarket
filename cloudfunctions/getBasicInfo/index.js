// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  let { openid } = event
  console.log(openid)
  const sheet = db.collection('users')
  let user = await sheet.where({
    _openid: _.eq(openid)
  }).get()
  let { avatarUrl, nickName } = user.data[0]
  return {
    avatarUrl, nickName, openid
  }
}
