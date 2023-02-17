/** 加载图片 */
export function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject('加载失败')
    img.src = url
  })
}
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
