import { ShapeFlags } from "@vue/shared"

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
  const mountChildren = (children, container) => {
    for(let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
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
  const patch = (n1,n2,container) => { //核心patch方法
    if(n1 === n2) return;
    if(n1 == null) {
      // 初次渲染
      mountElement(n2,container)
    } else {
      // 更新流程
    }
  }
  
  const render = (vnode, container) => {
    if(vnode == null) {
      // 卸载组件方法
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container.vnode = vnode
    // 如果当前vnode是空的话
  }
  return { render }
}