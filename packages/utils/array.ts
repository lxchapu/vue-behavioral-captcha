import { random } from './math'

/** 对数组随机排序 */
export function shuffle(list: number[], len?: number) {
  const res: number[] = []
  const cloneList = [...list]

  len = len ?? list.length

  for (let i = 0; i < len; i++) {
    res.push(cloneList.splice(random(0, cloneList.length), 1)[0])
  }

  return res
}
/** 生成从 0 到 n 的数组 */
export function range(len: number) {
  return [...Array(len).keys()]
}
