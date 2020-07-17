function Promisify(fn) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}
var fs = require('fs')
var readFile = Promisify(fs.readFile)

readFile('./promise/test.txt', 'utf-8').then((res) => {
  console.log(res)
})
