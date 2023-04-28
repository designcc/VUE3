import { isFunction } from "@vue/shared";
import { ReactiveEffect, tarckEffect, triggerEffect } from "./effect";
class ComputerRefImpl {
  public effect
  public _dirty = true //默认应该取值的时候进行计算
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public dep = new Set
  constructor(getter, public setter) {
    // 将用户的getter放到effect中， getter里数据会被整个effect收集起来
    this.effect = new ReactiveEffect(getter, () => {
      // 依赖变化执行调度函数
      if(!this._dirty) {
        this._dirty = true
        // 实现触发更新
        triggerEffect(this.dep)
      }
    })
  }
  // 类中的属性访问器 底层就是object.defineProperty
  get value() {
    if(this._dirty) {
      // 依赖收集
      tarckEffect(this.dep)
      this._dirty = false
      this._value = this.effect.run() //调用effect的run方法等于调用getter
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}
export function computer(getterOrOptions) {
  // onlygetter = () => { return state.name }
  let onlyGetter = isFunction(getterOrOptions); // 判断用户传入的是方法还是getorset选项
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("no set");
    };
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputerRefImpl(getter, setter)
}
