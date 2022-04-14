import globalData from './globalData'
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

export const dbAdd = (sheetName, data) => {
  const sheet = db.collection(sheetName)
  return sheet.add({ data })
}

export const dbSearchUser = (openid) => {
  const sheet = db.collection('users')
  return sheet.where({ _openid: _.eq(openid) }).get()
}

// 展示详情页时通过数据id向数据库查询数据
export const getGoodsDetails = async (data) => {
  return await wx.cloud.callFunction({
    name: 'getGoodsDetail',
    data
  }).then(res => {
    return res.result
  })
}

// 更新浏览量数据
export const updateView = (id, viewNow) => {
  db.collection('goods-shelf').doc(id).update({
    // data 传入需要局部更新的数据
    data: {
      view: viewNow + 1
    }
  })
}

// 获取首页展示的所有数据
export const getAllGoods = async () => {
  return await wx.cloud.callFunction({
    name: 'getAllGoods'
  }).then(res => {
    return res.result
  })
}

// 确认下单页的获取数据，需要对数据进行处理，只返回头图、简介、成色、价格、功能
export const getPurchaseGoodsData = async (id) => {
  const sheet = db.collection('goods-shelf')
  // 用数据id换取数据
  let { data: res } = await sheet.doc(id).get()
  const { openid, introduction, condition, ability, price, imgList } = res

  let tempImg = await wx.cloud.getTempFileURL({
    fileList: [imgList[0].url]
  })
  let headImg = (tempImg.fileList)[0].tempFileURL
  // 利用openid换取用户数据
  let { data: user } = await dbSearchUser(openid)
  const { avatarUrl, nickName } = user[0]
  let publisherInfo = { avatarUrl, nickName }
  return { id, introduction, condition, ability, price, publisherInfo, headImg }
}

// 上传订单数据
export const uploadOrder = async (datalist) => {
  return await wx.cloud.callFunction({
    name: 'uploadOrder',
    data: { datalist }
  }).then(res => {
    return res.result
  })
}

export const updateOrderStep = async (item, step) => {
  return await wx.cloud.callFunction({
    name: 'updateOrderStep',
    data: { item, step }
  }).then(res => {
    return res.result
  })
}

// 获取订单详情
export const getOrderDetails = async (id) => {
  const sheet = db.collection('orders')
  // 用数据id换取数据
  let res = (await sheet.doc(id).get()).data
  console.log(res)
}

// 根据分类搜索数据库 返回id，成色、功能、价格、用户头像名称、简介、头图
export const getClasses = async (data) => {
  return await wx.cloud.callFunction({
    name: 'getClassList',
    data
  }).then(res => {
    return res.result
  })
}

// 上传评论
export const uploadComment = async (data, id) => {
  return await wx.cloud.callFunction({
    name: 'uploadComment',
    data: {
      data, id
    }
  }).then(res => {
    return res.result
  })
}

// 上传回复
export const uploadReply = async (data, id) => {
  return await wx.cloud.callFunction({
    name: 'uploadReply',
    data: {
      data, id
    }
  }).then(res => {
    return res.result
  })
}

// 发布商品
export const uploadGoods = async (data, id) => {
  return await wx.cloud.callFunction({
    name: 'uploadGoods',
    data: {
      data, id
    }
  }).then(res => {
    return res.result
  })
}

export const getGoodsComments = async (data) => {
  return await wx.cloud.callFunction({
    name: 'getGoodsComments',
    data
  }).then(res => {
    return res.result
  })
}

export const getReply = async (data) => {
  return await wx.cloud.callFunction({
    name: 'getReply',
    data
  }).then(res => {
    return res.result
  })
}

export const getBasicInfo = async (openid) => {
  return await wx.cloud.callFunction({
    name: 'getBasicInfo',
    data: {
      openid
    }
  }).then(res => {
    return res.result
  })
}

// 获取收到的所有消息
export const getAllNews = async (data) => {
  return await wx.cloud.callFunction({
    name: 'getAllNews',
    data
  }).then(res => {
    return res.result
  })
}

// 修改消息为已读
export const updateRead = async (data) => {
  return await wx.cloud.callFunction({
    name: 'updateRead',
    data
  }).then(res => {
    return res.result
  })
}
