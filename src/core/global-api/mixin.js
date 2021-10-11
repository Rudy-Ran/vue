/* @flow */

import { mergeOptions } from '../util/index'
// 全局混入
export function initMixin (Vue: GlobalAPI) {
  // 利用mergeOptions合并两个选项
  Vue.mixin = function (mixin: Object) {
    //  在 Vue 的默认配置项上合并 mixin 对象
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
