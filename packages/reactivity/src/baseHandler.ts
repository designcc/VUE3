import { isObject } from "@vue/shared"
import { activeEffect, track, trigger } from "./effect"
import { reactive } from "./reactive"

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
  get(target, key, receiver) {
    // 去代理对象上取值  reflect反射指向代理对象不是源对象target
    if(key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)
    let res = Reflect.get(target,key,receiver)
    if(isObject(res)) {
      return reactive(res) //实现深度代理
    }
    return res
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target,key,value)
    if(result !== oldValue) {
      trigger(target, 'set', key, result, oldValue)
    }
    return true
  }
}