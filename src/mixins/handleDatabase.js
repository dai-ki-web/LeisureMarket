const db = wx.cloud.database()
const _ = db.command

export default {
  data: {

  },
  methods: {
    db_Add(sheetName, data) {
      const sheet = db.collection(sheetName)
      sheet.add({ data })
    }
  }
}
