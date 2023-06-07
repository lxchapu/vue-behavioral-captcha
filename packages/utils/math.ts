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

/**
 * 计算数组平均值
 * @param {number} list
 */
export function getAverage(list: number[]) {
  let sum = 0
  list.forEach((item) => {
    sum += item
  })
  return sum / list.length
}
/**
 * 计算数组方差
 * @param {number} list
 */
export function getVariance(list: number[]) {
  const average = getAverage(list)
  let sum = 0
  list.forEach((item) => {
    sum += Math.pow(item - average, 2)
  })
  return sum / list.length
}
/**
 * 计算数组标准差
 * @param {number} list
 */
export function getStandardVariance(list: number[]) {
  const variance = getVariance(list)
  return Math.sqrt(variance)
}

export function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Object.prototype.toString.call(v) === '[object Number]'
}
