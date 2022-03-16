// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
// 云函数入口函数
// 根据分类搜索数据库 返回id，成色、功能、价格、用户头像名称、简介、头图
exports.main = async (event, context) => {
  const sheet = db.collection('goods-shelf')
  let res = await sheet.get()
  return res.data
}
