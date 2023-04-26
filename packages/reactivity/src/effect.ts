export let activeEffect = undefined
function cleanupEffect(effect) {
  const {deps} = effect //传过来ReactiveEffect类的this实例对象 结构赋值取出deps
  for(let i = 0; i< deps.length; i++) {
    deps[i].delete(effect) //解除effect, 重新收集依赖
  }
  effect.deps.length = 0
}
class ReactiveEffect  {
  public active = true //这个是effect默认激活状态
  public parent = null //生成父子结构
  public deps = []
  constructor(public fn, public scheduler) {}
  run() {
    if(!this.active) {this.fn()} //这里表示如果非激活情况 只需要执行函数不需要进行依赖收集
    try{
      // 通过树形结构解决嵌套依赖 [e1->(parment) null, e2->(parment) e1]
      this.parent = activeEffect
      activeEffect = this
      // 这里需要执行用户函数之前清空deps里收集的依赖
      cleanupEffect(this)
      return this.fn() // 当稍后调用了取值操作的时候就可以获取到这个全局activeEffect
    }finally{
      activeEffect = this.parent
    }
  }
  stop(){
    if(this.active) {
      this.active = false
      cleanupEffect(this) //停止effect的收集
    }
  }
}

export function effect(fn,options:any ={}) {
  // 这里Fn可以根据状态变化,重新执行 effect可以嵌套写
  const _effect = new ReactiveEffect(fn, options.scheduler) //创建响应式的effect
  _effect.run() //默认先执行一遍
  const runner = _effect.run.bind(_effect) //绑定this执行
  runner.effect = _effect //将effect挂载到runner函数上
  return runner
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
  let effects = depsMap.get(key) //找到对应的effect
  if(effects) {
    // 执行前拷贝一份，解决set删除新增为同一引用
    effects = new Set(effects)
    effects.forEach(effect => {
      // 判断需要执行的effect是不是当前的effect 避免循环执行
      if(effect !== activeEffect) {
        if(effect.scheduler) {
          effect.scheduler() //判断是否有用户的调度 有就使用用户调度
        }else {
          effect.run() //触发更新再次调用用户传进去的函数
        }
      }
    })
  }
}