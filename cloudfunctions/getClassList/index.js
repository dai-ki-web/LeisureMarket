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
  let category = event.category.split(',')
  const sheet = db.collection('goods-shelf')
  let res = await sheet.aggregate().match({
    category: _.eq(category)
  }).lookup({
    from: 'users',
    let: {
      openid: '$_openid'
    },
    pipeline: $.pipeline().match(_.expr($.eq(['$_openid', '$$openid']))).project({
      _id: false,
      avatarUrl: true,
      nickName: true
    }).done(),
    as: 'publisher'
  }).project({
    publisher: true,
    introduction: true,
    price: true,
    condition: true,
    ability: true,
    headImg: $.slice(['$imgList', 1])
  }).end()

  // 换头图的临时链接
  res.list.forEach(async item => {
    let tempFile = await cloud.getTempFileURL({
      fileList: [item.headImg[0].url]
    }).then((res) => {
      return res.fileList[0].tempFileURL
    })
    item.headImg = tempFile
  })

  return res.list
}
