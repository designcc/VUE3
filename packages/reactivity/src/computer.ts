import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
class ComputerRefImpl {
  public effect
  public _dirty = true //默认应该取值的时候进行计算
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  constructor(getter, public setter) {
    // 将用户的getter放到effect中， getter里数据会被整个effect收集起来
    this.effect = new ReactiveEffect(getter, () => {
      // 依赖变化执行调度函数
    })
  }
  // 类中的属性访问器 底层就是object.defineProperty
  get value() {
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
    getter = onlyGetter;
    setter = () => {
      console.warn("no set");
    };
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputerRefImpl(getter, setter)
}
