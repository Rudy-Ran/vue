/* @flow */

import { parse } from 'compiler/parser/index'
import { generate } from './codegen'
import { optimize } from './optimizer'
import { createCompilerCreator } from 'compiler/create-compiler'

export const createCompiler = createCompilerCreator(
  /**
   * 将html模板解析成ast
   * 对 ast树进行静态标记
   * 将ast生成渲染函数
   * 静态渲染函数放到  code.staticRenderFns 数组
   * code.render 为动态渲染函数
   * 在将来渲染时执行渲染函数得到 vnode
   * @param {*} template
   * @param {*} options
   * @returns
   */
  function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 将模板解析成AST
  const ast = parse(template.trim(), options)
  optimize(ast, options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
