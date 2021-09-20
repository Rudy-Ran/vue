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
 * 遍历数组的七个方法
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 获取arrayProto的原型方法
  const original = arrayProto[method]
  // 分别在arrayMethods上定义7个数组方法
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果执行的是 push unshift splice操作，进行响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 进行依赖通知更新
    ob.dep.notify()
    return result
  })
})
