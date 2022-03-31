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
// 返回今天交易的数量
exports.main = async (event, context) => {
  let sheet = db.collection('orders')
  // 今天0点的毫秒数
  let last = moment().startOf('day').valueOf()
  let res = await sheet.where({
    timeStamp: _.gte(last)
    // 改：改完订单接口记得修改键名
  }).count()
  return res.total
}
