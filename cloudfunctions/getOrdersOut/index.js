// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
// 获取我卖出的订单内容
// status: ing：1 finished：2  全部: 0
exports.main = async (event, context) => {
  let { status } = event
  console.log(status)
  const sheet = db.collection('orders')

  // 在订单中查询step字段   1，2未进行中；3为已完成
  let aggregate
  if (status === 0) {
    aggregate = sheet.aggregate().match({
      step: _.gt(status)
    })
  } else if (status === 1) {
    aggregate = sheet.aggregate().match({
      step: _.lt(3)
    })
  } else {
    aggregate = sheet.aggregate().match({
      step: _.eq(3)
    })
  }
  // 对结果按照productId查询商品信息
  let { list } = await aggregate.lookup({
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
    let: { openid: '$buyerId' },
    // 找卖家
    pipeline: $.pipeline().match(
      _.expr($.eq(['$_openid', '$$openid']))
    ).project({
      _id: false,
      nickName: true,
      avatarUrl: true
    }).done(),
    as: 'buyer'
  }).replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(['$buyer', 0]), '$$ROOT'])
  }).project({
    buyer: false,
    item: false,
    _id: false,
    _openid: false
  }).end()
  return list
}
