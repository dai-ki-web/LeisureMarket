// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let { openid } = event
  const sheet = db.collection('users')
  return sheet.where({
    _openid: _.eq(openid)
  }).get().then(user => {
    console.log(user.data[0])
    let { avatarUrl, nickName } = user.data[0]
    return {
      avatarUrl, nickName, openid
    }
  }).catch(err => {
    console.log(err)
    return {}
  })
}
