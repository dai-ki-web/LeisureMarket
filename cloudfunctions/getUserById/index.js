// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event
  const sheet = db.collection('users')
  return sheet.doc(id).get().then(res => {
    return res.data
  }).catch(err => {
    console.log(err)
    return {}
  })
}
