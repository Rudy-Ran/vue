/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

// 初始化全局API入口
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  // vue的全局默认配置
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 将配置代理到vue对象上 通过Vue.config方式访问
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 向外暴露一些内部的工具方法
  Vue.util = {
    // 日志
    warn,
    // 将A对向上的属性复制到B上
    extend,
    // 合并选项
    mergeOptions,
    // 给对象设置getter setter 涉及到依赖收集 更新触发通知
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 向外暴露为对象设置响应式的方法
  Vue.observable = <T>(obj: T): T => {
    // 为对象设置响应式
    observe(obj)
    return obj
  }
  // Vue.options = {component:{},directive:{},filter:{}} 
  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 将vue构造函数赋值给Vue.options._base
  Vue.options._base = Vue
  // 将keep-alive组件放到Vue.options.componets对象中
  extend(Vue.options.components, builtInComponents)
  // 初始化Vue.use
  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
