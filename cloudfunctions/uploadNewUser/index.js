// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { avatarUrl, nickName, auth } = event
  const { OPENID } = cloud.getWXContext()
  const sheet = db.collection('users')
  return sheet.add({ data: { avatarUrl, nickName, auth, _openid: OPENID } }).then(res => {
    return res._id
  }).catch(err => {
    console.log(err)
    return ''
  })
}
