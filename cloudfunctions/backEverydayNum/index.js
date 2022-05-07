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
  let { range } = event
  let clap = []
  let res = []
  for (let i = 0;i < range;i++) {
    let date = moment().subtract(i, 'days').add(1, 'days').startOf('day').valueOf()
    clap.unshift(date)
    res.push(0)
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

  clap.forEach((axis, index) => {
    list.forEach(item => {
      if (item._id === axis) {
        res[index] = item.count
      }
    })
  })
  // console.log(res)
  return res
}
