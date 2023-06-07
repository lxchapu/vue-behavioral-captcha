import { ref, reactive, onMounted, computed } from 'vue'
import { drawBlock, drawMissingBlock, randomImg, loadImg, random } from '../utils'

import type { PuzzleBlockType } from '../types'
import type { Ref } from 'vue'

/** 计算拼图块大小 */
export function useBlockSize(
  blockType: Ref<PuzzleBlockType>,
  blockSize: Ref<number>,
  blockPadding: number
) {
  /** 凸起半径 */
  const bulgeR = computed(() => blockSize.value / 5)

  /** 凸起圆心偏移 */
  const bulgeOffset = computed(() => bulgeR.value * Math.cos(0.7))

  /** 拼图块大小 包含凸起 */
  const blockBaseWidth = computed(() => {
    if (blockType.value === 'jigsaw') {
      return blockSize.value + bulgeR.value + bulgeOffset.value
    } else {
      return blockSize.value
    }
  })

  /** 拼图块大小 包含左右边距 */
  const blockRealWidth = computed(() => blockBaseWidth.value + blockPadding * 2)

  return {
    bulgeR,
    bulgeOffset,
    blockBaseWidth,
    blockRealWidth,
  }
}
/** 生成滑动拼图验证码 */
export function useSlidePuzzleCaptcha(
  width: Ref<number>,
  height: Ref<number>,
  blockType: Ref<PuzzleBlockType>,
  blockSize: Ref<number>,
  blockRadius: Ref<number>,
  imgList: Ref<string[]>
) {
  /** 安全边距 */
  const safePadding = 4
  /** 拼图块左右边距 */
  const blockPadding = 2

  const { bulgeR, bulgeOffset, blockBaseWidth, blockRealWidth } = useBlockSize(
    blockType,
    blockSize,
    blockPadding
  )

  /** 状态 */
  const state = reactive({
    loadingError: '',
    loading: false,
  })

  const fullCanvasRef = ref<HTMLCanvasElement>()
  const bgCanvasRef = ref<HTMLCanvasElement>()
  const blockCanvasRef = ref<HTMLCanvasElement>()
  let fullCtx: CanvasRenderingContext2D | null = null,
    bgCtx: CanvasRenderingContext2D | null = null,
    blockCtx: CanvasRenderingContext2D | null = null

  /** 滑动距离 */
  const blockLeft = ref(0)

  let answer = 0

  /** 初始化验证码 */
  async function initCaptcha() {
    /* 重置状态 */
    state.loading = true
    state.loadingError = ''
    blockLeft.value = 0

    /** 生成坐标 */
    const randomX = random(
      blockRealWidth.value + safePadding,
      width.value - safePadding - blockBaseWidth.value
    )
    const randomY = random(safePadding, height.value - safePadding - blockBaseWidth.value)

    answer = randomX - blockPadding
    /** 生成随机图片 */
    const bgImg = randomImg(imgList.value)
    /** 清空画布 */
    clearCanvas()
    try {
      /* 加载图片 */
      const img = await loadImg(bgImg)
      /* 渲染验证码 */
      renderFullCanvas(fullCtx!, img)
      renderBgCanvas(bgCtx!, img, randomX, randomY)
      renderBlockCanvas(blockCtx!, img, randomX, randomY)
    } catch (error: any) {
      state.loadingError = error
      throw error
    } finally {
      state.loading = false
    }
  }

  /** 清空画布 */
  function clearCanvas() {
    fullCtx!.clearRect(0, 0, width.value, height.value)
    bgCtx!.clearRect(0, 0, width.value, height.value)
    blockCtx!.clearRect(0, 0, width.value, height.value)
  }

  /** 渲染完整图片 */
  function renderFullCanvas(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    ctx.drawImage(img, 0, 0, width.value, height.value, 0, 0, width.value, height.value)
  }
  /** 渲染背景 */
  function renderBgCanvas(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number
  ) {
    drawMissingBlock(ctx, {
      type: blockType.value,
      x,
      y,
      width: blockSize.value,
      height: blockSize.value,
      bulgeR: bulgeR.value,
      bulgeOffset: bulgeOffset.value,
      radius: blockRadius.value,
    })
    /* 绘制背景 */
    ctx.save()
    ctx.globalCompositeOperation = 'destination-over'
    ctx.drawImage(img, 0, 0, width.value, height.value, 0, 0, width.value, height.value)
    ctx.restore()
  }
  /** 绘制拼图块 */
  function renderBlockCanvas(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number
  ) {
    drawBlock(ctx, {
      type: blockType.value,
      x,
      y,
      width: blockSize.value,
      height: blockSize.value,
      bulgeR: bulgeR.value,
      bulgeOffset: bulgeOffset.value,
      radius: blockRadius.value,

      img,
      canvasHeight: height.value,
      canvasWidth: blockRealWidth.value,
      safePadding: blockPadding,
    })
  }

  /** 检查验证码是否通过 */
  function validateCaptcha(range: number) {
    return Math.abs(answer - blockLeft.value) < range
  }

  onMounted(() => {
    fullCtx = fullCanvasRef.value!.getContext('2d')
    bgCtx = bgCanvasRef.value!.getContext('2d')
    blockCtx = blockCanvasRef.value!.getContext('2d')
  })

  return {
    fullCanvasRef,
    bgCanvasRef,
    blockCanvasRef,
    blockLeft,
    state,
    blockRealWidth,
    initCaptcha,
    validateCaptcha,
  }
}
