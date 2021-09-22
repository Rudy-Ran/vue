import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
// 定义 Vue.prototype._init方法
initMixin(Vue)
/**
 * Vue.prototype.$data
 * Vue.prototype.$props
 * Vue.prototype.$set
 * Vue.prototype.$delete
 * Vue.prototype.$watch
 */
stateMixin(Vue)
/**
 * Vue.prototype.$on
 * Vue.prototype.$once
 * Vue.prototype.$off
 * Vue.prototype.$emit
 */
eventsMixin(Vue)
/**
 * Vue.prototype._update
 * Vue.prototype.$forceUpdate
 * Vue.prototype.$destory
 */
lifecycleMixin(Vue)
/**
 * Vue.prototype.$nextTick
 * Vue.prototype._render
 */
renderMixin(Vue)

export default Vue
