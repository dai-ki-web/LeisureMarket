// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  let { id, mode } = event
  const sheet = db.collection('orders')
  // 用id查找订单数据
  console.log(mode)
  if (mode === 1) {
    let { list } = await sheet.aggregate().match({
      _id: _.eq(id)
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
      let: { openid: '$buyerId' },
      // 在goods中根据buyerId查找用户
      pipeline: $.pipeline().match(
        _.expr($.eq(['$_openid', '$$openid']))
      ).project({
        _id: false,
        nickName: true
      }).done(),
      as: 'puber'
    }).replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$puber', 0]), '$$ROOT'])
    }).project({
      puber: false,
      item: false,
      _id: false
    }).end()

    return list[0]
  } else {
    console.log('else')
    let { list } = await sheet.aggregate().match({
      _id: _.eq(id)
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
      // 在goods中根据_openid查找用户
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
      _id: false
    }).end()

    return list[0]
  }
}
