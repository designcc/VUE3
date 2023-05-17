import { ShapeFlags, isString } from "@vue/shared"
import { Text, createVnode, isSameVnode } from "./vnode"

export function createRenderer(renderOptions) {
  let {
    // 增加 删除 修改 查询
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = renderOptions
  const normalize = (child) => {
    if(isString(child)) {
      return createVnode(Text, null, child)
    }
    return child
  }
  const mountChildren = (children, container) => {
    for(let i = 0; i < children.length; i++) {
      let child = normalize(children[i])
      patch(null, child, container)
    }
  }
  const mountElement = (vnode,container) => {
    let { type, props, children, shapeFlag} = vnode
    let el = vnode.el = hostCreateElement(type) //将真实节点挂载到这个虚拟节点，后续复用节点更新
    if(props) {
      for(let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 数组
      mountChildren(children, el)
    }
    hostInsert(el,container)
  }

  const processText = (n1,n2,container) => {
    if(n1 === null) {
      hostInsert((n2.el=hostCreateText(n2.children)),container)
    } else {
      // 更新 文本内容变化 节点复用老的
      const el = n2.el = n1.el
      if(n1.children !== n2.children) {
        hostSetText(el, n2.children) //文本更新
      }
    }
  }
  const patchProps = (oldProps,newProps,el) => {
    for(let key in newProps) { // 新的里面有，直接用新的覆盖即可
      hostPatchProp(el,key,oldProps[key],newProps[key])
    }
    for(let key in oldProps) { //老的里面没有 则直接删除
      if(newProps[key] == null) {
        hostPatchProp(el,key,oldProps[key], null)
      }
    }
  }
  const patchChildren = (n1,n2,el) => {
    // 比较两个虚拟节点儿子的差异， el就是当前的父节点
    const c1 = n1 && n1.children
    const c2 = n2 && n2.children
    // children 文本 空null 数组
  }
  const patchElement = (n1,n2,container) => { // 先复用节点 比较属性和儿子
    let el = n2.el = n1.el
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    patchProps(oldProps,newProps, el)
    patchChildren(n1,n2,el)
  }
  const processElement = (n1,n2,container) => {
    if(n1 == null) {
    // 初次渲染
    // 后续还有组件的初次渲染，目前是元素的初始化渲染
      mountElement(n2, container)
    } else {
      // 更新流程 patchElement()
      patchElement(n1,n2,container)
    }
  }
  const patch = (n1,n2,container) => { //核心patch方法
    if(n1 === n2) return;
    if(n1 && !isSameVnode(n1,n2)) { // 判断两个元素是否相同 不同卸载
      unmount(n1) // 删除老的
      n1 == null
    }
    const {type,shapeFlag} = n2
    switch(type) {
      case Text:
        processText(n1,n2,container);
        break
      default:
        if(shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1,n2,container)
        }
    }
  }
  
  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }
  const render = (vnode, container) => {
    if(vnode == null) {
      // 卸载组件方法
      if(container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
    // 如果当前vnode是空的话
  }
  return { render }
}
// 文本处理，需要自己增加类型，因为不能通过document.createElement('text')
// 如果传入null的时候则是卸载逻辑，需要dom节点删除