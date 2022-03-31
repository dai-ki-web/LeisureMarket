const moment = require('moment')
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 返回今天发布的商品数量
exports.main = async (event, context) => {
  let sheet = db.collection('goods-shelf')
  // 今天0点的毫秒数
  let last = moment().startOf('day').valueOf()
  let res = await sheet.where({
    createTime: _.gte(last)
  }).count()
  return res.total
}
