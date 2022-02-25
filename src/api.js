import globalData from './globalData'
const db = wx.cloud.database()
const _ = db.command

export const dbAdd = (sheetName, data) => {
  const sheet = db.collection(sheetName)
  return sheet.add({ data })
}

// export const dbSearchOpenid = (sheetName, data) => {
//   const sheet = db.collection(sheetName)
//   return sheet.where({ _openid: _.eq(data) }).get()
// }

export const dbSearchUser = (openid) => {
  const sheet = db.collection('users')
  return sheet.where({ _openid: _.eq(openid) }).get()
}

// 展示详情页时通过数据id向数据库查询数据
export const getGoodsData = async (id) => {
  const sheet = db.collection('goods-shelf')
  // 用数据id换取数据
  let res = (await sheet.doc(id).get()).data
  const { openid } = res
  // 利用openid换取用户数据
  let user = (await dbSearchUser(openid)).data[0]
  const { avatarUrl, nickName } = user
  let publisherInfo = { avatarUrl, nickName }
  return { res, publisherInfo }
}

// 更新浏览量数据
export const updateView = (id, viewNow) => {
  db.collection('goods-shelf').doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      // 表示将 done 字段置为 true
      view: viewNow + 1
    }
  })
}

// 获取首页展示的所有数据
export const getAllGoods = () => {
  return db.collection('goods-shelf').get()
}

// 确认下单页的获取数据，需要对数据进行处理，只返回头图、简介、成色、价格、功能
export const getPurchaseGoodsData = async (id) => {
  const sheet = db.collection('goods-shelf')
  // 用数据id换取数据
  let res = (await sheet.doc(id).get()).data
  const { openid, introduction, condition, ability, price, imgList } = res

  let tempImg = await wx.cloud.getTempFileURL({
    fileList: [imgList[0].url]
  })
  let headImg = (tempImg.fileList)[0].tempFileURL
  // 利用openid换取用户数据
  let user = (await dbSearchUser(openid)).data[0]
  const { avatarUrl, nickName } = user
  let publisherInfo = { avatarUrl, nickName }
  return { introduction, condition, ability, price, publisherInfo, headImg }
}

// 上传订单数据
export const uploadOrder = async (id, step) => {
  const sheet = db.collection('orders')
  const shelf = db.collection('goods-shelf')
  const user = db.collection('users')
  let timeStamp = Date.now()

  // 将订单内包含的商品的状态修改为已卖出
  let modifyTasks = id.map(item => {
    return shelf.doc(item).update({
      data: {
        status: 2
      }
    })
  })
  Promise.all(modifyTasks)

  let info = await globalData.userInfo()
  // 数据库中添加订单数据（每一个商品生成一条）
  let addTasks = id.map(item => {
    return sheet.add({ data: { productId: item, step, timeStamp } })
  })
  let resArr = await Promise.all(addTasks).then(res => {
    return res.map(item => { return item._id })
  })
  await user.doc(info._id).update({
    data: {
      orders: _.push(resArr)
    }
  })
  return resArr
}

// 获取订单详情
export const getOrderDetails = async (id) => {
  const sheet = db.collection('orders')
  // 用数据id换取数据
  let res = (await sheet.doc(id).get()).data
  console.log(res)
}
