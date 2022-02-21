export const randProductId = (openid, timeStamp) => {
  let id = openid.split('')
  let time = timeStamp.toString().split('')
  let res = ''
  for (let i = 0;i < id.length;i++) {
    res += id[i]
    res += time[i % time.length]
  }
  return res
}
