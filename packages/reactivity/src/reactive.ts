import { isObject } from "@vue/shared";
import { ReactiveFlags, mutableHandlers } from "./baseHandler";


// 实现同一个对象代理多次返回同一个
// 代理对象再次代理可以直接返回
const reactiveMap = new WeakMap()
export function reactive(target) {

  if(!isObject(target)){
    return
  }
  if(target[ReactiveFlags.IS_REACTIVE]) { // 如果目标对象是一个代理对象，那么一定被代理过了会走get
    return target
  }
  // 查看map缓存， 如果有就不执行Proxy重复代理 直接返回
  let exisitingProxy = reactiveMap.get(target)
  if(exisitingProxy) {
    return exisitingProxy
  }
  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}