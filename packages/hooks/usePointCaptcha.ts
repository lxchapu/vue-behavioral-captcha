import type { Ref } from 'vue'
import type { PointCaptchaType, PointTextItem } from '../types'

import { ref, reactive, onMounted } from 'vue'

import {
  drawText,
  randomIdiom,
  randomImg,
  randomText,
  shuffle,
  random,
  randomHexColor,
  range,
  loadImg,
  getDistance,
} from '../utils'

/** 生成验证码中的文字 */
function createTextList(
  w: number,
  h: number,
  textList: string[],
  minFontSize = 26,
  maxFontSize = 36,
  safePadding = 15
) {
  const cell = maxFontSize * 1.6
  const colMaxNum = Math.floor((w - safePadding * 2) / cell)
  const rowMaxNum = Math.floor((h - safePadding * 2) / cell)

  const indexList = shuffle(range(colMaxNum * rowMaxNum), textList.length)

  /** 生成 x 坐标 */
  function getX(colIndex: number, fontSize: number) {
    const sx = (w - colMaxNum * cell) / 2 + colIndex * cell
    const ex = sx + cell - fontSize

    return random(sx, ex)
  }
  /** 生成 y 坐标 */
  function getY(rowIndex: number, fontSize: number) {
    const sy = (h - rowMaxNum * cell) / 2 + rowIndex * cell
    const ey = sy + cell - fontSize

    return random(sy, ey)
  }

  return indexList.map((item, index) => {
    const colIndex = item % colMaxNum
    const rowIndex = Math.floor(item / colMaxNum)
    const fontSize = random(minFontSize, maxFontSize)

    return {
      x: getX(colIndex, fontSize),
      y: getY(rowIndex, fontSize),
      text: textList[index],
      fontSize,
      color: randomHexColor(),
      angle: random(-90, 90),
    }
  })
}
/** 生成点触式验证码 */
export function usePointCaptcha(
  width: Ref<number>,
  height: Ref<number>,
  type: Ref<PointCaptchaType>,
  imgList: Ref<string[]>
) {
  const imgCanvasRef = ref<HTMLCanvasElement>()
  let imgCtx: CanvasRenderingContext2D | null = null

  const textList = ref<PointTextItem[]>([])
  /** 绘制点 */
  const pointList = ref<{ x: number; y: number }[]>([])
  /** 状态 */
  const state = reactive({
    loadingError: '',
    loading: false,
  })

  /** 初始化验证码 */
  async function initCaptcha() {
    /* 重置状态 */
    textList.value = []
    pointList.value = []
    state.loading = true
    state.loadingError = ''

    /** 生成随机字 */
    let list = []
    if (type.value === 'order') {
      list = randomText(5)
    } else {
      const idiom = randomIdiom()
      list = idiom.split('')
    }
    textList.value = createTextList(width.value, height.value, list)
    /** 生成随机图片 */
    const bgImg = randomImg(imgList.value)
    /* 清空画布 */
    imgCtx!.clearRect(0, 0, width.value, height.value)
    try {
      /* 加载图片 */
      const img = await loadImg(bgImg)
      /* 绘制背景 */
      imgCtx!.drawImage(img, 0, 0, width.value, height.value, 0, 0, width.value, height.value)
      /* 绘制文字 */
      textList.value.forEach((item) => {
        drawText(imgCtx!, item)
      })
    } catch (error: any) {
      state.loadingError = error
      throw error
    } finally {
      state.loading = false
    }
  }

  /** 检查验证码是否通过 */
  function validateCaptcha() {
    let success = true
    pointList.value.forEach((item, index) => {
      const { text, inRange } = getClosestText(item.x, item.y)

      if (!inRange || textList.value[index].text !== text) success = false
    })
    return success
  }

  /** 获取最接近的文字 */
  function getClosestText(x: number, y: number) {
    let text = '',
      inRange = false,
      minD = -1

    textList.value.forEach((item) => {
      const d = getDistance(item.x + item.fontSize / 2, item.y + item.fontSize / 2, x, y)
      if (minD < 0 || d < minD) {
        minD = d
        text = item.text
        inRange = d <= item.fontSize / 2
      }
    })

    return {
      text,
      inRange,
    }
  }

  onMounted(() => {
    imgCtx = imgCanvasRef.value!.getContext('2d')
  })

  return {
    imgCanvasRef,
    textList,
    pointList,
    state,
    initCaptcha,
    validateCaptcha,
  }
}
