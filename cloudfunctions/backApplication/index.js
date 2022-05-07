// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 检测新的申请信息并返回
exports.main = async (event, context) => {
  const users = db.collection('users')
  let { list } = await users.aggregate().match({
    auth: _.eq(false)
  }).match({
    verify: _.exists(true)
  }).project({
    nickName: false,
    avatarUrl: false
  }).end()

  let n_list = list.map(item => {
    let { url } = item.verify.file
    cloud.downloadFile({
      fileID: url
    }).then(res => {
      item.verify.file = res.fileContent.toString('utf8')
    })
  })
  return n_list
}
