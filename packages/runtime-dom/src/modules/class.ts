export function patchClass(el,nextValue) {
  if(nextValue == null) {
    // 如果不需要 class直接移除
    el.removeAttribute('class')
  } else {
    // 有新的class类名 就直接新的替换老的
    el.className = nextValue
  }
}