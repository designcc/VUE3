export const nodeOps = {
  // 添加 删除 修改 查询
  insert(child, parent, anchor=null) {
    parent.insertBefore(child, anchor) // insertBefore 第二参数为null等价于appendChild

  },
  remove(child) {
    // 删除节点
    const parentNode = child.parentNode
    if(parentNode){
      parentNode.removeChild(child)
    }
  },
  setElementText(el,text){
    // 给dom节点设置文本内容
    el.textContent = text
  },
  setText(node,text) { //document.createTextNode()
    node.nodeValue = text
  },
  querySelector(selector) {
    return document.querySelector(selector)
  },
  parentNode(node) {
    return node.parentNode
  },
  nextSibling(node) {
    return node.nextSibling
  },
  createElement(tagName) {
    return document.createElement(tagName)
  },
  createText(text) {
    return document.createTextNode(text)
  }
}