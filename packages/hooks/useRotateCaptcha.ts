import { reactive, ref, onMounted } from 'vue'
import { drawRoundedImg, randomImg, loadImg, random } from '../utils'

import type { Ref } from 'vue'

/** 生成旋转验证码 */
export function useRotateCaptcha(size: Ref<number>, imgList: Ref<string[]>) {
  /** 状态 */
  const state = reactive({
    loadingError: '',
    loading: false,
  })
  const imgCanvasRef = ref<HTMLCanvasElement>()
  let imgCtx: CanvasRenderingContext2D | null = null
  /** 旋转角度 */
  const imgAngle = ref(0)

  let answer = 0

  /** 初始化验证码 */
  async function initCaptcha() {
    /* 重置状态 */
    state.loading = true
    state.loadingError = ''
    imgAngle.value = 0

    /** 生成角度 */
    answer = random(10, 350)
    /** 生成随机图片 */
    const bgImg = randomImg(imgList.value)
    /* 清空画布 */
    imgCtx!.clearRect(0, 0, size.value, size.value)
    try {
      /* 加载图片 */
      const img = await loadImg(bgImg)
      /* 绘制图片 */
      drawRoundedImg(imgCtx!, {
        x: 0,
        y: 0,
        r: size.value / 2,
        rangle: answer,
        img,
      })
    } catch (error: any) {
      state.loadingError = error
      throw error
    } finally {
      state.loading = false
    }
  }

  /** 检查验证码是否通过 */
  function validateCaptcha(range: number) {
    return Math.abs(answer + imgAngle.value - 360) < range
  }

  onMounted(() => {
    imgCtx = imgCanvasRef.value!.getContext('2d')
  })

  return {
    imgCanvasRef,
    state,
    imgAngle,
    initCaptcha,
    validateCaptcha,
  }
}
