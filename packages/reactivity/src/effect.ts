export let activeEffect = undefined
class ReactiveEffect  {
  public active = true //这个是effect默认激活状态
  public parent = null
  public deps = []
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

const targetMap = new WeakMap()
export function track(target, type, key) {
  if(!activeEffect) return
  let depsMap = targetMap.get(target); //判断是否已经收集了目标对象
  if(!depsMap) {
    targetMap.set(target, (depsMap = new Map())) //没有就创建一个新的weakMap映射表，键是对象，值是一个Map结构
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key,(dep= new Set()))
  }
  let shouldTrack = !dep.has(activeEffect) //去重
  if(shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep) // 让effect记录对应的dep,清理时使用 实现双向绑定
  }
}
// WackMap = {object:Map{name:Set-> effect}}
export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if(!depsMap) return // 触发的值不在模板中使用
  const effect = depsMap.get(key) //找到对应的effect
  effect && effect.forEach(effect => {
    if(effect !== activeEffect) effect.run() //触发更新再次调用用户传进去的函数
  })
}