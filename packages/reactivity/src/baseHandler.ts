import { activeEffect } from "./effect"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
  get(target, key, receiver) {
    // 去代理对象上取值  reflect反射指向代理对象不是源对象target
    if(key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    activeEffect
    return Reflect.get(target,key,receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target,key,value)
  }
}