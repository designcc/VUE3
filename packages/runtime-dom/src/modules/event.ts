function createInvoker(callback) {
  const invoker = (e) => invoker.value(e)
  invoker.value = callback
  return invoker
}

export function patchEvent(el, eventName, nextValue) {
  // remove -> add ===> add + 自定义事件(里面调用绑定方法)
  let invokers = el._vei || (el.vei = {}) //事件缓存
  let exits = invokers[eventName] // 先查看是否有缓存
  if(exits && nextValue) { // 已经绑定了事件
    exits.value = nextValue // 没有卸载函数 只是改了invoker.value属性
  } else {
    let event = eventName.slice(2).toLowerCase() // 拿到绑定事件
    if(nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    } else if (exits) { // 没有新的却有老值， 需要将老的绑定事件移除
      el.removeEventListener(event,exits)
      invokers[eventName] = undefined
    }
  }
}