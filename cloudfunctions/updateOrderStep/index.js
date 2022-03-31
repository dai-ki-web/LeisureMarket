// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { item, step } = event
  console.log(item, step)
  const sheet = db.collection('orders')

  sheet.doc(item).update({
    data: {
      step: step
    }
  }).then(res => {
    console.log(res.errMsg)
    return true
  }).catch(err => {
    console.log(err.errMsg)
    return false
  })
}
