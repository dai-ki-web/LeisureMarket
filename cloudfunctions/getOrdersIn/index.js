// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 获取我买到的订单内容
// status: 1 2 3
exports.main = async (event, context) => {
  let status = parseInt(event.status)
  console.log(status)
  const sheet = db.collection('orders')

  // 在订单中查询step字段
  // 对结果按照productId查询商品信息
  let { list } = await sheet.aggregate().match({
    step: _.eq(status)
  }).lookup({
    from: 'goods-shelf',
    let: { productId: '$productId' },
    pipeline: $.pipeline().match(
      _.expr($.eq(['$_id', '$$productId']))
    ).project({
      _id: false,
      _openid: true,
      headImg: true,
      introduction: true,
      price: true
    }).done(),
    as: 'item'
  }).replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(['$item', 0]), '$$ROOT'])
  }).lookup({
    from: 'users',
    let: { openid: '$_openid' },
    // 找卖家
    pipeline: $.pipeline().match(
      _.expr($.eq(['$_openid', '$$openid']))
    ).project({
      _id: false,
      nickName: true,
      avatarUrl: true
    }).done(),
    as: 'puber'
  }).replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(['$puber', 0]), '$$ROOT'])
  }).project({
    puber: false,
    item: false,
    _id: false,
    buyerId: false
  }).end()
  return list
}
