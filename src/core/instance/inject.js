/* @flow */

import { hasOwn } from 'shared/util'
import { warn, hasSymbol } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'

// 解析组件配置项上的 provide 对象，将其挂载到 vm._provided 属性上
export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}
/**
 * 解析inject选项
 * 1. 得到{key : value}形式的配置对象
 * 2. 对解析结果做响应式处理
 * @param {*} vm
 */
export function initInjections (vm: Component) {
  // 从配置项上解析 inject选项，最后得到result[key] = val 的结果
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        // 对解析的结果做响应式处理，将每个key代理到vue实例上
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}

export function resolveInject (inject: any, vm: Component): ?Object {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null)
    // 获取inject配置项的所有key
    const keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject)
    // 遍历inject选项中key组成的数组
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      // 跳过__ob__对象
      if (key === '__ob__') continue
      // 拿到provide中对应的key
      const provideKey = inject[key].from
      let source = vm
     // 遍历所有的祖代组件，直到 根组件，找到 provide 中对应 key 的值，最后得到 result[key] = provide[provideKey]
      while (source) {
        // 如果祖代存在provide 并且保存了当前寻找的provideKey
        if (source._provided && hasOwn(source._provided, provideKey)) {
          // 结果赋值
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      // 如果没有找到
      if (!source) {
        // 设置默认值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
