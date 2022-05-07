// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
// 云函数入口函数
// 返回所有在架商品信息 返回id，价格、用户头像名称、简介、头图
exports.main = async (event, context) => {
  const sheet = db.collection('goods-shelf')
  let res = await sheet.aggregate().match({
    status: 1
  }).lookup({
    from: 'users',
    let: {
      openid: '$_openid'
    },
    pipeline: $.pipeline().match(_.expr($.eq(['$_openid', '$$openid']))).project({
      _id: false,
      avatarUrl: true,
      nickName: true,
      _openid: true
    }).done(),
    as: 'publisher'
  }).sort({
    createTime: -1
  }).project({
    publisher: true,
    introduction: true,
    price: true,
    condition: true,
    ability: true,
    headImg: true
  }).end()

  return res.list
}
