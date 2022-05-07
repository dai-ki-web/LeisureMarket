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
  console.log(id)
  const sheet = db.collection('users')
  sheet.doc(id).update({
    data: { auth: true }
  })
}
