
// const Promise = require("./promise3")


// var p = new Promise((resolve, reject) => {
//   resolve(1)
// }).then((res) => {
//   // console.log(p === new Promise(() => {}))
//   console.log(typeof p)
//   return p
// }, err => {

// })
// var thenable = { then: function(r) {
//   r('qqqq');
//   // return 1
// }};

// var p2 = new Promise((resolve) => {
//   resolve(new Promise((r) => {
//     r(2)
//   }))
// }).then((res) => {
//   return res
// }).then((e) => {
//   console.log('qqqqq', e)
// })

// var p1 = new Promise((resolve, reject) => {
//   resolve(Promise.resolve(2).then(() => {
//     return Promise.reject('err')
//   }))
// })
// var p2 = new Promise((resolve, reject) => {
//   resolve(3)
// })
// Promise.race([p1, p2]).then(res => {
//   console.log(res)
// }, err => {
//   console.log('fail', err)
// })

Promise.resolve().then(() => {
  console.log(1)
  Promise.resolve().then(() => {
    console.log(11)
  }).then(() => {
    console.log(22)
  }).then(() => {
    console.log(33)
  })
}).then(() => {
  console.log(2)
}).then(() => {
  console.log(3)
})
