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
  let { OPENID } = cloud.getWXContext()
  let { data: comment, id } = event
  comment.userId = OPENID
  const sheet = db.collection('comments')

  let result = await sheet.add({
    data: {
      ...comment,
      goodId: id,
      createTime: db.serverDate(),
      root: 0,
      haveRead: 0
    }
  }).then(res => {
    return true
  }).catch(err => {
    // console.log(err)
    return false
  })

  return result
}
