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
  let { id } = event
  const sheet = db.collection('reply')

  let res = await sheet.where({
    replyTo: _.eq(id)
  }).get()

  return res.data
}
