import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
const renderOptions = Object.assign(nodeOps, {patchProp}) //domAPI 属性API
console.log(renderOptions);

export function render(vnode, container) {
  // 创建渲染器的时候， 传入选项
  createRenderer(renderOptions).render(vnode,container)
}
export * from "@vue/runtime-core"