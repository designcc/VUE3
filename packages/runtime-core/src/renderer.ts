import { ShapeFlags, isString } from "@vue/shared"
import { Text, createVnode, isSameVnode } from "./vnode"
import { getSequene } from "./sequene"

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
  const normalize = (child, i) => {
    if(isString(child[i])) {
      let vnode = createVnode(Text, null, child[i])
      child[i] = vnode
    }
    return child[i]
  }
  const mountChildren = (children, container) => {
    for(let i = 0; i < children.length; i++) {
      let child = normalize(children, i) // 处理后要进行替换， 否则children中存放的依旧是字符串
      patch(null, child, container)
    }
  }
  const mountElement = (vnode,container,anchor) => {
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
    hostInsert(el,container,anchor)
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
        hostPatchProp(el,key,oldProps[key], undefined)
      }
    }
  }

  const unmountChildren = (children) => {
    // 循环删除节点
    for(let i=0;i<children.length; i++) {
      unmount(children[i])
    }
  }
  const patchKeyedChildren = (c1,c2,el) => { // 比较两个儿子的差异
    let i = 0
    let e1 = c1.length -1
    let e2 = c2.length -1
    // sync from start
    while(i <= e1 && i <=e2) { // 有任何一方停止循环则直接跳出
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVnode(n1,n2)) {
        patch(n1,n2,el) // 比较两个节点的属性和子节点
      }else {
        break;
      }
      i++
    }
    // sync from en
    while(i<=e1 && i<=e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if(isSameVnode(n1,n2)) {
        patch(n1,n2,el) // 比较两个节点的属性和子节点
      }else {
        break;
      }
      e1--
      e2--
    }
    //common sequence + mount
    // i比e1大说明有新增
    // i和e2之间的是新增的部分
    if(i > e1) {
      if(i <= e2) {
        while (i <= e2) {
          const nextPos = e2+1
          // 根据下一个的索引来看参照物
          const anchor = nextPos < c2.length ?  c2[nextPos].el : null
          patch(null, c2[i],el,anchor) //创建新节点 放进容器
          i++
        }
      }
    } else if(i > e2) {
      // common sequence + unmount
      // i比e2大说明有要卸载
      // i到e1之间的就是要卸载
      if(i <= e1) {
        while(i <= e1) {
          unmount(c1[i])
          i++
        }
      }
    }
    //乱序比较
    let s1 = i
    let s2 = i
    const keyToNewIndexMap = new Map() // key => newIndex
    for (let i = s2; i<= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }
    // 循环老的元素， 看下新的里面有没有， 如果有说明要比较差异，没有要添加到列表中，老的有新的没有要删除
    const toBePatched = e2 - s2 + 1 //新的总个数
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0) //记录是否比对过的映射表
    for(let i=s1;i<=e1;i++) {
      const oldChild = c1[i] //老的孩子
      let newIndex = keyToNewIndexMap.get(oldChild.key) //用老的孩子去新的里面找
      if(newIndex == undefined) {
        unmount(oldChild) //卸载多余的
      } else {
        // 新的位置对应老的位置， 如果数组放的值>0说明已经patch过了
        newIndexToOldIndexMap[newIndex-s2] = i+1 // 用来标记当前patch过的结果
        patch(oldChild, c2[newIndex], el)
      }
    } // 到这里新老属性的儿子的对比，没有移动位置
    // 移动位置

    // 获取最长递增子序列
    let increment = getSequene(newIndexToOldIndexMap)
    let j = increment.length - 1
    for(let i = toBePatched-1; i>=0; i--) {
      let index = i + s2
      let current = c2[index]; //找到当前的元素 然后往前插入新的元素
      let anchor = index + 1 < c2.length ? c2[index+1].el : null
      if(newIndexToOldIndexMap[i] === 0) {
        // 新增
        patch(null,current,el,anchor)
      } else {
        if(i != increment[j]){
          // 不是0说明存在新旧比对 倒叙插入
          hostInsert(current.el, el, anchor)
        } else {
          j--
        }
        
      }
      // 最长递增序列来实现 乱序已存在元素调整位置  vue2在移动元素会有浪费
    }
  }
  
  const patchChildren = (n1,n2,el) => {
    // 比较两个虚拟节点儿子的差异， el就是当前的父节点
    const c1 = n1 && n1.children
    const c2 = n2 && n2.children
    // children 文本 空null 数组
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除所有节点
        // 文本 数组 （删除老儿子，设置文本内容）
        unmountChildren(c1)
      }
      if(c1 !== c2) {
        // 文本 文本 （更新文本即可）包括文本和空
        hostSetElementText(el,c2)
      }
    }else {
       if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 数组 数组 （diff算法）
          patchKeyedChildren(c1,c2,el)
        }else {
          //现在不是数组（文本和空）
          unmountChildren(c1)
        }
       }else {
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 数组 文本 (清除文本，进行挂载)
          hostCreateText(el, '')
        }
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          //数组 文本 （清除文本进行挂载）
          mountChildren(c2,el)
        }
       }
    }
  }
  const patchElement = (n1,n2,container) => { // 先复用节点 比较属性和儿子
    let el = n2.el = n1.el
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    patchProps(oldProps,newProps, el)
    patchChildren(n1,n2,el)
  }
  const processElement = (n1,n2,container,anchor) => {
    if(n1 == null) {
    // 初次渲染
    // 后续还有组件的初次渲染，目前是元素的初始化渲染
      mountElement(n2, container,anchor)
    } else {
      // 更新流程 patchElement()
      patchElement(n1,n2,container)
    }
  }
  const patch = (n1,n2,container,anchor = null) => { //核心patch方法
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
          processElement(n1,n2,container,anchor)
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