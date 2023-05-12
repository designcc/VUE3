import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

// dom属性的操作api
export function patchProp(el,key,prevValue,nextValue) { // el.setAttribute
   // 类名 el.className
   if(key === 'calss') {
      patchClass(el, nextValue)
   }else if (key === 'style') {
      // 样式 el.style
      patchStyle(el,prevValue,nextValue)
   } else if (/^on[^a-z]/.test(key)) {
      // events
      patchEvent(el,key,nextValue)
   } else {
      // 普通属性
      patchAttr(el, key, nextValue)
   }
}