// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { dataId, root } = event
  const sheet = root ? db.collection('reply') : db.collection('comments')
  let isSuccess = await sheet.doc(dataId).update({
    data: {
      haveRead: 1// 已读
    }
  }).then(res => {
    return true
  }).catch(err => {
    return false
  })

  return isSuccess
}
