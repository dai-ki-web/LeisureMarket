// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function sortBy(field) {
  return function (a, b) {
    return a[field] - b[field]
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  let { OPENID: user } = cloud.getWXContext()

  // 查找评论
  const comSheet = db.collection('comments')
  // 查找回复
  const reSheet = db.collection('reply')

  let commentTask = comSheet.aggregate().match({
    reply2UserId: _.eq(user)
  }).lookup({
    from: 'goods-shelf',
    let: { goodId: '$goodId' },
    pipeline: $.pipeline().match(_.expr($.eq(['$_id', '$$goodId']))).project({
      headImg: true
    }).done(),
    as: 'product'
  }).project({
    reply2UserId: false
  }).end()

  let replyTask = reSheet.aggregate().match({
    reply2UserId: _.eq(user)
  }).lookup({
    from: 'goods-shelf',
    let: { goodId: '$goodId' },
    pipeline: $.pipeline().match(_.expr($.eq(['$_id', '$$goodId']))).project({
      headImg: true
    }).done(),
    as: 'product'
  }).project({
    reply2UserId: false,
    reply2Name: false,
    reply2CommentId: false
  }).end()

  let tasks = [commentTask, replyTask]

  let all = await Promise.all(tasks).then(res => {
    return [...res[0].list, ...res[1].list].sort(sortBy('createTime'))
  })

  return all
}
