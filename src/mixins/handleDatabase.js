const db = wx.cloud.database()
const _ = db.command

export default {
  data: {

  },
  methods: {
    db_Add(sheetName, data) {
      const sheet = db.collection(sheetName)
      sheet.add({ data })
    },
    db_Search_Openid(sheetName, data) {
      const sheet = db.collection(sheetName)
      return sheet.where({ _openid: _.eq(data) }).get()
    }
  }
}
