export const randProductId = (_id, timeStamp) => {
  let id = _id.split('')
  let time = timeStamp.toString().split('')
  let res = ''
  for (let i = 0;i < id.length;i++) {
    res += id[i]
    res += time[i % time.length]
  }
  return res
}
