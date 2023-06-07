import { random } from './math'

/** 加载图片 */
export function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject('加载失败')
    img.src = url
  })
}

/** 获取随机图片 */
export function randomImg(imgList: string[]) {
  return imgList[random(0, imgList.length)]
}
