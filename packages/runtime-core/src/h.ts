import { isArray, isObject } from "@vue/shared"
import { createVnode, isVnode } from "./vnode"

export function h(type, propsChildren, children) {
  const l = arguments.length
  // h('div', {style: {'color': 'red'}})
  // h('div', h('span'))
  // h('div', [h('span'),h('span')])
  // h('div', 'hello')
  if(l === 2) {
    if(isObject(propsChildren) && !isArray(propsChildren)) {
      if(isVnode(propsChildren)) { // 虚拟节点就包装成数组 数组可以循环创建
        return createVnode(type, null, [propsChildren])
      }
      return createVnode(type, propsChildren) //属性
    }else {
      return createVnode(type, null, propsChildren) //是数组 | 文本
    }
  } else {
    if(l > 3) {
      children = Array.from(arguments).slice(2) // 超过三位后面的都是儿子
    } else if(l === 3 && isVnode(children)) {
      // h('div', {style: {'color': 'red'}}, h('span'))
      children = [children]
    }
    return createVnode(type,propsChildren, children)
  }
}