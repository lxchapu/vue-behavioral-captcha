/**
 * 获取随机数
 * 返回值包含 lower 不包含 upper
 * @param {number} lower
 * @param {number} upper
 * @param {boolean} float 默认为 false 返回整数
 */
export function random(lower: number, upper: number, float: boolean = false) {
  if (float) {
    return lower + Math.random() * (upper - lower)
  } else {
    lower = Math.ceil(lower)
    upper = Math.floor(upper)
    return Math.floor(lower + Math.random() * (upper - lower))
  }
}
/** 限制最大最小值 */
export function clamp(value: number, lower: number, upper: number) {
  if (value <= lower) return lower
  if (value >= upper) return upper
  return value
}

/** 计算两点距离 */
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
