export let activeEffect = undefined
class ReactiveEffect  {
  public active = true //这个是effect默认激活状态
  constructor(public fn) {}
  run() {
    if(!this.active) {this.fn()} //这里表示如果非激活情况 只需要执行函数不需要进行依赖收集
    try{
      activeEffect = this
      return this.fn() // 当稍后调用了取值操作的时候就可以获取到这个全局activeEffect
    }finally{
      activeEffect = undefined
    }
  }
}


export function effect(fn) {}