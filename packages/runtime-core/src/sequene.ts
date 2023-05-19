export function getSequene(arr) {
  const len = arr.length
  const result = [0] //以默认第0
  const p = new Array(len).fill(0) //最后要标记索引 放的东西不关心 但是要和数组一样长
  let start;
  let end;
  let middle
  let resultLastIndex;
  for(let i=0; i<len; i++) {
    let arrI= arr[i]
    if(arrI !== 0) { //序列位0， 没有意义需要创建
      resultLastIndex = result[result.length - 1]
      if(arr[resultLastIndex] < arrI) { //比较最后一项和当前项的值，如果最后一项大 则将当前索引放在结果集中
        result.push(i)
        p[i] = resultLastIndex //当前放在末尾的要记住前面是谁
        continue
      }
      // 这里通过二分查找 再结果集中找到比当前值大的，用当前索引将其替换
      start = 0
      end = result.length -1
      while(start < end) { //start === end的时候停止 这个二分查找索引
        middle = ((start+end)/2) | 0
        if(arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // 找到中间值后，我们需要做替换操作 start/end
      if(arr[result[end]] > arrI) { // 这里用当前这一项替换掉比当前大的哪一项
        result[end] = i
        p[i] = result[end -1] //记住他的前一个是谁
      }
    }
  }
  let i = result.length
  let last = result[i-1]
  while(i-- >0) { //倒叙追溯
    result[i] =last // 最后一项是确定的
    last = p[last]
  }
  return result
}
console.log(getSequene([5,3,4,0,5]));
