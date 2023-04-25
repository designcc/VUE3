export let activeEffect = undefined
class ReactiveEffect  {
  public active = true //这个是effect默认激活状态
  public parent = null
  constructor(public fn) {}
  run() {
    if(!this.active) {this.fn()} //这里表示如果非激活情况 只需要执行函数不需要进行依赖收集
    try{
      // 通过树形结构解决嵌套依赖 [e1->(parment) null, e2->(parment) e1]
      this.parent = activeEffect
      activeEffect = this
      return this.fn() // 当稍后调用了取值操作的时候就可以获取到这个全局activeEffect
    }finally{
      activeEffect = this.parent
    }
  }
}


export function effect(fn) {
  // 这里Fn可以根据状态变化,重新执行 effect可以嵌套写
  const _effect = new ReactiveEffect(fn) //创建响应式的effect
  _effect.run() //默认先执行一遍
}