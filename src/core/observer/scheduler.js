/* @flow */

import type Watcher from './watcher'
import config from '../config'
import { callHook, activateChildComponent } from '../instance/lifecycle'

import {
  warn,
  nextTick,
  devtools,
  inBrowser,
  isIE
} from '../util/index'

export const MAX_UPDATE_COUNT = 100

const queue: Array<Watcher> = []
const activatedChildren: Array<Component> = []
let has: { [key: number]: ?true } = {}
let circular: { [key: number]: number } = {}
let waiting = false
let flushing = false
let index = 0

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
export let currentFlushTimestamp = 0

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now()
  }
}

/**
 * Flush both queues and run the watchers.
 */
/**
 * 刷新队列 友flushCallbacks函数负责调用
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  // flushing = true 表示现在的watcher队列正在刷新
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort((a, b) => a.id - b.id)
  /**
   * 刷新队列之前先给队列排序（升序），可以保证：
   *   1、组件的更新顺序为从父级到子级，因为父组件总是在子组件之前被创建
   *   2、一个组件的用户 watcher 在其渲染 watcher 之前被执行，因为用户 watcher 先于 渲染 watcher 创建
   *   3、如果一个组件在其父组件的 watcher 执行期间被销毁，则它的 watcher 可以被跳过
   * 排序以后在刷新队列期间新进来的 watcher 也会按顺序放入队列的合适位置
   */
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 循环遍历watcher队列 依次执行watcher 的run方法
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    // 首先执行before钩子
    if (watcher.before) {
      watcher.before()
    }
    // 清空缓存，表示当前watcher已经被执行 当该watcher再次入队时就可以进来了
    id = watcher.id
    has[id] = null
    // 执行 watcher.run，最终触发更新函数，比如 updateComponent
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false
  activatedChildren.push(vm)
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */

// 将watcher放入watcher队列
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    // 判重，watcher不会重复入队列
    // watcher如果入队，会缓存一下 置为true
    has[id] = true
    if (!flushing) {
      // flaushing = false 表示当前watcher队列没有被刷新 watcher直接入队
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // watcher队列已经在被刷新了 这个时候watcher入队需要特殊处理一下
      // 保证 watcher入队后 刷新中的watcher队列仍然有序
      let i = queue.length - 1
      // 找到watcher.id大于 queue[i].id的位置 插入
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      // wating = false 表示当前浏览器的异步任务队列中没有 flushSchedulerQueue
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        // 同步执行 直接刷新watcher队列
        // 性能就会大打折扣
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
