/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'
// Vue.extend方法
export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   * 扩展Vue子类，该子类同样支持进一步的扩展，预设一些配置项
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    // 用同一个配置项多次调用Vue.extend方法时，后面会开始使用缓存
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    // 验证组件名称
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }
    // 定义一个vue子类 Sub 构造函数，和 Vue 构造函数一样
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    // 设置子类的原型对象  通过原型继承的方式继承 Vue
    Sub.prototype = Object.create(Super.prototype)
    // 设置构造函数
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 合并父类的选项和传递过来的选项
    // 可以通过Vue.extend方法定义一个子类,预设一些配置项 这些配置项就相当于直接使用Vue构造函数时的默认配置一样
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    // 记录自己的父类
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.

    // 将props和computed代理到子类上，在子类支持通过this.xxx方式访问
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // 定义 extend、mixin、use 这三个静态方法，允许在 Sub 基础上再进一步构造子类
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.

    // 定义 component、filter、directive 三个静态方法
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    // 组件递归自调用的实现原理 如果组件设置了 name 属性，则将自己注册到自己的 components 选项中
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.

    // 在扩展时保留对基类选项的引用。
    // 稍后在实例化时，我们可以检查 Super 的选项是否具有更新
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
     // 缓存
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
