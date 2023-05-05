import { isArray, isObject } from "@vue/shared"
import { reactive } from "./reactive"
import { tarckEffect, triggerEffect } from "./effect"

function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
class Refmpl {
  public _value
  public dep = new Set
  public __v_isRef =true
  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }
  get value() {
    tarckEffect(this.dep)
    return this._value
  }
  set value(newValue) {
    if(newValue!==this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffect(this.dep)
    }
  }
}

export function ref(value) {
  return new Refmpl(value)
}

class ObjectRefImpl { // 将.value属性代理到原始对象上
  constructor(public object, public key){
    
  }
  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object,key)
}

export function toRefs(object) {
  const result = isArray(object) ? new Array(object.length) : {}
  for (let key in object) {
    result[key] = toRef(object, key)
  }
  return result
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      let r = Reflect.get(target,key,receiver)
      return r.__v_isRef ? r.value : r
    },
    set(target,key,value,reactive) {
      let oldValue = target[key]
      if(oldValue.__v_isRef) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target,key,reactive)
      }
    }
  })
}