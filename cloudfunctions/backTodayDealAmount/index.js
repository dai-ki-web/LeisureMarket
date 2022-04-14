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
// 返回今天交易的金额总数
exports.main = async (event, context) => {
  let sheet = db.collection('orders')
  // 今天0点的date
  let zero = moment().startOf('day')._d

  let res = await sheet.aggregate().match({
    // 用createTime从orders中寻找今天的数据——大于今天零点
    createTime: _.gte(zero)
  }).lookup({
    // 通过productId联表查询goods-Shelf，返回价格
    from: 'goods-shelf', localField: 'productId', foreignField: '_id', as: 'product'
  }).replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(['$product', 0]), '$$ROOT'])
  }).project({
    price: 1
  }).group({
    // 求总和
    _id: null,
    totalPrice: $.sum('$price')
  }).end()
  console.log(res)

  return res.list.length ? res.list[0].totalPrice : 0
}
