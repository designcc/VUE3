export function patchStyle(el,prevValue,nextValue={}) {
  // 样式需要对比差异
  for(let key in nextValue) {
    el.style[key] = nextValue[key]
  }
  if(prevValue) {
    for(let key in prevValue) {
      // 老的属性有 新的没有就删除
      if(nextValue[key] == null) {
        el.style[key] = null
      }
    }
  }
}