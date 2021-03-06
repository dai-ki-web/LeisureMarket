export const TITLES = {
  category: '分类',
  condition: '成色',
  ability: '功能'
}

export const CATEGORIES = {
  图书: ['教辅', '小说', '社科', '诗集', '散文'],
  生活用品: ['文具', '个人护理', '体育器材', '收纳用品', '床品'],
  食品: ['方便速食', '冲调饮品', '零食'],
  其他: ['玩具', '唱片', '数码']
}

export const CONDITON_OPTIONS = [
  {
    value: 1,
    label: '全新'
  },
  {
    value: 2,
    label: '几乎全新'
  },
  {
    value: 3,
    label: '轻微使用痕迹'
  },
  {
    value: 4,
    label: '明显使用痕迹'
  }
]

export const CONDITONS = {
  1: '全新',
  2: '几乎全新',
  3: '轻微使用痕迹',
  4: '明显使用痕迹'
}

export const ABILITY_OPTIONS = [
  {
    value: 1,
    label: '功能完好无瑕疵'
  },
  {
    value: 2,
    label: '有瑕疵，不影响使用'
  },
  {
    value: 3,
    label: '有明显瑕疵'
  },
  {
    value: 4,
    label: '无法正常使用'
  }
]

export const ABILITIES = {
  1: '功能完好无瑕疵',
  2: '有瑕疵，不影响使用',
  3: '有明显瑕疵',
  4: '无法正常使用'
}

// 商品状态
// 0：在架可售  1：下架

export const STEPS = {
  1: '等待付款',
  2: '等待交易',
  3: '交易完成'
}
