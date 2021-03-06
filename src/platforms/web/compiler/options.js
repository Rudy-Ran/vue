/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  // 处理class style v-model
  modules,
  // 处理指令
  directives,
  // 是否是pre标签
  isPreTag,
  // 是否是自闭合标签
  isUnaryTag,
  // 规定一些应该使用 props进行绑定的属性
  mustUseProp,
  // 可以只写开始标签的标签，结束标签浏览器会自动补全
  canBeLeftOpenTag,
  // 是否是保留标签 html + svg
  isReservedTag,
  // 获取标签命名空间
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
