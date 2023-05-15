import { ShapeFlags, isArray, isString } from "@vue/shared";

export function isVnode(value) {
  return !!(value && value.__v_isVnode)
}

// 虚拟节点有很多： 组件 元素 文本 h('h1')
export function createVnode(type, props, children=null) {
  // 组合方案shapeFlag 我想知道一个元素中包含多个儿子还是一个儿子 标识
  let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vnode = {
    type,
    props,
    children,
    el: null, // 虚拟节点上对应的真是节点，后续diff算法
    key: props?.['key'],
    __v_isVnode: true,
    shapeFlag
  }
  // 虚拟dom就是一个对象， 方便diff算法 夸平台， 真是dom属性比较多
  if(children) {
    let type = 0
    if(isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else { 
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }
  return vnode
}