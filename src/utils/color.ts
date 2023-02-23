import { random } from './number'
/** 获取随机 16 进制颜色 */
export function randomHexColor() {
  return '#' + random(0, 0xffffff).toString(16).padEnd(6, '0')
}
