import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
function traversal(value, set= new Set()) {
  if(!isObject(value)) return value
  if(set.has(value)) {
    return value
  }
  for(let key in value) {
    traversal(value[key], set)
  }
  return value
}
// source是用户传入的对象
// watch等于effect 内部会保存老值和新值调用方法
export function watch(source,cd) {
  let getter
  if(isReactive(source)){
    // 对用户传入的数据进行循环（递归循环，只要循环就会访问对象的每一个属性，访问属性的时候就会收集effect）
    getter = () => traversal(source)
  } else if (isFunction(source)){
    getter = source
  } else {
    return
  }
  let cleanup
  const onCleanup = (fn) => {
    cleanup = fn // 保存用户传过来的函数
  }
  let oldValue
  const job = () => {
    if(cleanup) cleanup() //闭包缓存 使上一次的clear变成true 下一次watch触发上次watch清理
    const newValue = effect.run()
    cd(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter, job)
  oldValue = effect.run()
}