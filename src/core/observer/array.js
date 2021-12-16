/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

// 基于数组的原型对象创建新的对象
// 复写（增强）数组原型方法 使其具有依赖通知更新的能力
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 * 遍历数组的七个方法 拦截变异方法并触发事件
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 获取arrayProto的原型方法
  const original = arrayProto[method]
  // 分别在arrayMethods(基于数组原型创建的对象)上定义7个数组方法 通过Object.defineProperty 拦截
  // 这样在访问 methodsToPatch 定义的7个方法时就不在访问的是原生的方法了 而是自己定义的mutator函数 
  def(arrayMethods, method, function mutator (...args) {
    // 先执行原生的方法
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
     // 如果 method 是以下三个之一，说明是新插入了元素
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果执行的是 push unshift splice操作，对新插入的元素进行响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change 
    // 进行依赖通知更新
    ob.dep.notify()
    return result
  })
})
