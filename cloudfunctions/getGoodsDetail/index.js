// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 展示详情页时通过数据id向数据库查询数据:图片、用户信息、简介、价格、浏览量、评论、功能、成色、时间戳
exports.main = async (event, context) => {
  let { id } = event
  const sheet = db.collection('goods-shelf')
  const users = db.collection('users')

  let good = await sheet.doc(id).get()
  let { _openid, introduction, imgList, price, view, condition, ability, timeStamp } = good.data

  // 用openid换发布者信息
  let user = await users.where({
    _openid: _.eq(_openid)
  }).get()
  let { avatarUrl, nickName } = user.data[0]

  let tempImgs = imgList.map(item => {
    return item.url
  })

  // 换图片的临时链接
  // let tempUrls = await cloud.getTempFileURL({
  //   fileList: tempImgs
  // }).then((res) => {
  //   return res.fileList
  // })

  // let tempImgList = tempUrls.map(item => {
  //   return item.tempFileURL
  // })

  return { goods: { introduction, tempImgs, price, view, condition, ability, timeStamp }, publisher: { avatarUrl, nickName, userId: _openid } }
}
