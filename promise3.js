const STATE = {
  PENDING: 'pending',
  ONFULFILLED: 'fulfilled',
  ONREJECTED: 'rejected'
}
function resolvePromise(x, promise, resolve, reject) {
  if (x === promise) { // then里面会返回一个promise，如果这个promise刚好就是自己，抛错
    throw TypeError('TypeError: Chaining cycle detected for promise #<Promise>')
  }
  // 防止promise既调成功，也调失败
  let called = false
  // 判断x是否是一个promise，或者一个thenable对象, 或者一个function
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then
      if (typeof then === 'function') {
        // 这里x是一个promise，那么其上有对应的state, value, reason
        // 如果 x 是一个普通的包含then函数的对象
        //
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(y, promise, resolve, reject)
        }, r => {
          if (called) return
          called = true
          reject(r)
        })
      } else {
        if (called) return
        called = true
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    if (called) return
    called = true
    // 否则x是一个普通值, 直接返回
    resolve(x)
  }

}
class Promise {
  constructor(executor) {
    this.value = undefined
    this.reason = undefined
    this.state = STATE.PENDING
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    const resolve = (value) => {
      if (this.state !== STATE.PENDING) return
      if (value && typeof value.then === 'function') {
        resolvePromise(value, this, resolve, reject)
        return
      }
      this.value = value
      this.state = STATE.ONFULFILLED
      this.onFulfilledCallbacks.forEach((fn) => fn())
    }
    const reject = (reason) => {
      if (this.state !== STATE.PENDING) return
      this.reason = reason
      this.state = STATE.ONREJECTED
      this.onRejectedCallbacks.forEach((fn) => fn())
    }
    try {
      executor(resolve, reject)
    } catch(e) {
      reject(e)
    }
  }
  static resolve(value) {
    return new Promise((resolve) => {
      resolve(value)
    })
  }
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
  catch(errCallback) {
    this.then(null, errCallback)
  }
  finally(callback) {
    return this.then((value) => {
      return Promise.resolve(callback(value)).then(() => value)
    }, (reason) => {
      return Promise.resolve(callback(reason)).then(() => {throw reason})
    })
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : (e) => {throw e}
    let promise2 = new Promise((resolve, reject) => {
      // then是异步的，这里添加一个定时器
      if (this.state === STATE.ONFULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            // x 可能是一个普通值，也可能是一个新的promise，
            // 也可能是一个thenable对象， 也可能是一个function
            /**
             * x 需要对x进行处理
             * promise2 需要判断x不是
             * resolve 新的promise对应的resolve
             * reject 新的promise对应的reject
             */

            resolvePromise(x, promise2, resolve, reject)
          } catch(e) {
            reject(e)
          }
        }, 0)
      }
      if (this.state === STATE.ONREJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            // x 可能是一个普通值，也可能是一个新的promise，也可能是一个thenable对象
            resolvePromise(x, promise2, resolve, reject)
          } catch(e) {
            reject(e)
          }
        })
      }
      if (this.state === STATE.PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(x, promise2, resolve, reject)
            } catch(e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(x, promise2, resolve, reject)
            } catch(e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2
  }
  catch(errCallback) {
    return this.then(null, errCallback)
  }
}
Promise.all = function(values) {
  function resolvePromise(value) {
    if (value && typeof value.then === 'function') {
      return value.then((res) => {
        return resolvePromise(res)
      }, (err) => {
        throw err
      })
    } else {
      return value
    }
  }
  return new Promise((resolve, reject) => {
    let results = [], index = 0
    function processResultByKey(value, i) {
      results[i] = value
      if (++index === values.length) {
        resolve(results)
      }
    }
    for (let i = 0; i < values.length; i++) {
      let value = values[i]
      Promise.resolve(resolvePromise(value)).then((res) => {
        processResultByKey(res, i)
      }, (e) => {
        reject(e)
      })
    }
  })
}
Promise.race = function(values) {
  function resolvePromise(value) {
    if (value && typeof value.then === 'function') {
      return value.then((res) => {
        return resolvePromise(res)
      }, (err) => {
        throw err
      })
    } else {
      return value
    }
  }
  return new Promise((resolve, reject) => {
    for (let i = 0; i < values.length; i++) {
      let value = values[i]
      Promise.resolve(resolvePromise(value)).then((res) => {
        resolve(res)
      }, (e) => {
        reject(e)
      })
    }
  })


}
Promise.defer = Promise.deferred = function() {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
module.exports = Promise