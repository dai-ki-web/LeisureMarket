// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-0guqmlrwce7ddc4b'
})
const db = cloud.database()

const genOrderID = () => {
  return Math.floor(Math.random() * (99999999 - 10000000) + 10000000) + Date.now().toString(36)
}

// 云函数入口函数
// 创建订单
exports.main = async (event, context) => {
  let { datalist } = event
  let { OPENID: buyerId } = cloud.getWXContext()
  const order = db.collection('orders')
  const shelf = db.collection('goods-shelf')
  // const user = db.collection('users')

  // 数据库中添加订单数据（每一个商品生成一条）
  let addTasks = datalist.map(item => {
    // 将商品状态改为下架
    shelf.doc(item).update({
      data: {
        status: 0
      }
    })
    return order.add({
      data: {
        productId: item, // 对应的商品id
        step: 1, // 订单所处节点
        createTime: db.serverDate(), // 订单创建时间
        buyerId, // 购买者id
        orderId: genOrderID()// 随机生成的订单号
      }
    })
  })
  let resArr = await Promise.all(addTasks).then(res => {
    return res.map(item => { return item._id })
  })
  return resArr
}
