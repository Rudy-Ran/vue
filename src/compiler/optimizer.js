/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */

<<<<<<< HEAD
=======
// 遍历AST，标记每个节点是静态节点还是动态节点，然后标记静态根节点
// 这样在后续的更新中就不需要再关注这些静态节点
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  if (!root) return
  // 函数 获取静态key 比如staticStyle、staticClass
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  // 判断是否是平台保留标签
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  markStatic(root)
  // second pass: mark static roots.
  markStaticRoots(root, false)
}

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node: ASTNode) {
  node.static = isStatic(node)
  if (node.type === 1) {
<<<<<<< HEAD
    // 不要将组件的插槽内容设置为静态节点：这样可以避免
    // 1. 组件不能改变插槽节点
    // 2. 静态插槽内容在热重载是失败
=======
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
      /**
     *  不要将组件的插槽内容设置为静态节点，这样可以避免：
     *   1、组件不能改变插槽节点
     *   2. 静态插槽内容在热重载时失败
     **/
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
<<<<<<< HEAD
      // 递归终止条件 如果节点不是平台保留标签 && 也不是slot标签 && 也不是内联模板 结束
=======
        // 递归终止条件，如果节点不是平台保留标签  && 也不是 slot 标签 && 也不是内联模版，则直接结束
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
      return
    }
    // 递归标记子节点的 static属性
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
<<<<<<< HEAD
      // 如果子节点非静态 父节点更新为非静态节点
=======
      // 如果子节点非静态，则父节点更新为非静态节点
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
      if (!child.static) {
        node.static = false
      }
    }
<<<<<<< HEAD
    // 如果节点存在 v-if v-else-if v-else 这些指令 则依次标记 block 中的节点static
=======
    // 如果节点存在 v-if、v-else-if、v-else 这些指令，则依次标记 block 中节点的 static
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

function markStaticRoots (node: ASTNode, isInFor: boolean) {
  if (node.type === 1) {
    if (node.static || node.once) {
      // 节点是静态的 或者 节点上有 v-once 指令，标记 node.staticInFor = true or false
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 节点本身是静态节点，而且有子节点，而且子节点不只是一个文本节点，则标记为静态根 => node.staticRoot = true，否则为非静态
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      // 节点本身为静态节点 而且有子节点 并且子节点不只是一个文本节点 则标记为静态根节点
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
<<<<<<< HEAD
    // 当节点不是静态跟节点的时候 递归遍历子节点 标记静态根
=======
    // 当前节点不是静态根节点的时候，递归遍历其子节点，标记静态根
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
<<<<<<< HEAD
      // 如果节点存在 v-if、v-else-if、v-else 指令，则为 block 节点标记静态根
=======
     // 如果节点存在 v-if、v-else-if、v-else 指令，则为 block 节点标记静态根
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}
/**
<<<<<<< HEAD
 * 判断是否是静态节点：
 * 通过自定义的node.type判断 
 * 凡是有v-bind v-if v-for等指令都属于动态节点
 * 组件为动态节点
 * 父节点含有v-for指令的template标签 为动态节点
 * @param {*} node 
 * @returns 
=======
 * 判断节点是否为静态节点
 * 通过自定义的node.type来判断 2:表达式(动态) 3:文本:静态
 * 凡是有 v-bind、v-if、v-for 等指令的都属于动态节点
 * 组件为动态节点
 * 父节点为含有 v-for 指令的 template 标签，则为动态节点
 * @param {*} node
 * @returns
>>>>>>> 45eb2200176e1c74a5f204eb9407cb9ab56d9ef5
 */
function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
