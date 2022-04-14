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
// 查询每日发布数变化
exports.main = async (event, context) => {
  const range = 7
  let clap = []
  for (let i = 0;i < range;i++) {
    let date = moment().subtract(i, 'days').add(1, 'days').startOf('day').valueOf()
    clap.unshift(date)
  }
  console.log(clap)
  const sheet = db.collection('goods-shelf')
  let { list } = await sheet.aggregate().bucket({
    groupBy: '$createTime',
    boundaries: clap,
    default: 'earlier',
    output: {
      count: $.sum(1)
    }
  }).end()
  // console.log(list)
  return list
}
