/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    // 获取vue实例
    const vm: Component = this
    // a uid 每个vue实例都有一个_uid 依次递增 保证唯一
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // 初始化时候的一个性能度量  --- 开始初始化
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // vue的实例不应该被响应式处理  这里做个标记
    vm._isVue = true
    // merge options
    // 处理配置项 对options进行合并 将相关的属性和方法同一放到 vm.$options中，为后续的调用做准备
    // vue.$options的属性包括： 1. vue构造函数预先定义（constructor）  2.new Vue传入
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.

      // 子组件走这里：组件配置对象上的一些深层次属性放到 vm.$options 选项中，以提高代码的执行效率
      initInternalComponent(vm, options)
    } else {
      // 根组件：选项合并，将全局配置项合并到根组件的局部配置项上  比如：Vue.components注册的全局组件会合并到根实例的components选项中

      // 至于每个子组件的选项合并则发生在两个地方：
      // 1、Vue.component 方法注册的全局组件在注册时做了选项合并 (全局API)
      // 2、{ components: { xx } } 方式注册的局部组件在执行编译器生成的 render 函数时做了选项合并，包括根组件中的 components 配置  (编译器)
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 组件关系属性的初始化 $parent $root $children
    initLifecycle(vm)
    // 初始化自定义事件
    initEvents(vm)
    // render 初始化 初始化插槽 获取this.$slot 定义this._c 即createElement 方法（h函数）
    initRender(vm)
    callHook(vm, 'beforeCreate')
    // 初始化inject选项
    initInjections(vm) // resolve injections before data/props
    // 响应式原理的核心 处理 props methods computed data watch选项
    initState(vm)
    // 处理provide选项
    initProvide(vm) // resolve provide after data/props
    /**
     * 总结provide inject实现
     * 通常我们使用是通过provide注入，inject获取数据，但实际上并不是真正意义上的注入，而是子组件自下向上从祖代去获取数据
     */
    callHook(vm, 'created')

    /* istanbul ignore if */
    //  结束初始化
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 如果有el选项，自动执行mount
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

// 性能优化，打平配置对象上的属性，减少运行时原型链的查找，提高执行效率
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  //  基于构造函数上的配置对象创建vm.$options
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.

  //```````````````把组件传进来的一些配置赋值到vm.$options上````````````````````
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// 从构造函数上解析配置项options
export function resolveConstructorOptions (Ctor: Class<Component>) {
  // 从实例构造函数上获取选项
  let options = Ctor.options

  // 如果存在父类 在通过Vue.extend构造子类的时候 Vue.extend方法会为Ctor添加一个super属性
  if (Ctor.super) {


    // *  Ctor.super是通过Vue.extend构造子类的时候。Vue.extend方法会为Ctor添加一个super属性，指向其父类构造器
    // *  如果构造函数上有super 说明Ctor是Vue.extend构建的子类  换句话说就是检查是否有父级组件
    // *  然后再用递归的方式获取基类上的配置选项,也就是获取所有上级的options合集


    const superOptions = resolveConstructorOptions(Ctor.super)
    // 缓存基类的配置选项
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // 如果不一致，说明基类的配置项发生了改变 需要重新设置
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 找到发生更改的选项
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        // 将更改的选项和extend选项合并
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // 将新的选项赋值给options
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

// 解析构造函数中后续被修改后者增加的选项
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  // 构造函数的选项
  const latest = Ctor.options
   // 密封的构造函数选项，备份
   // 执行Vue.extend时封装的"自身"options，这个属性就是方便检查"自身"的options有没有变化
  const sealed = Ctor.sealedOptions
   // 遍历当前构造器上的options属性，如果在"自身"封装的options里没有，则证明是新添加的
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
