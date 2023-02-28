import type { BlockType } from '@/types'
import type { Ref } from 'vue'

import { computed, onMounted, ref } from 'vue'
import { drawBlock, drawMissingBlock } from './canvas'

/** 计算拼图块大小 */
export function useBlockSize(
  blockType: Ref<BlockType>,
  blockSize: Ref<number>,
  blockPadding: Ref<number>
) {
  /** 凸起半径 */
  const bulgeR = computed(() => blockSize.value / 5)

  /** 凸起圆形偏移 */
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
  const blockRealWidth = computed(() => blockBaseWidth.value + blockPadding.value * 2)

  return {
    bulgeR,
    bulgeOffset,
    blockBaseWidth,
    blockRealWidth,
  }
}

/** 滑动拼图验证码渲染函数 */
export function useSlideCaptchaRender(
  width: Ref<number>,
  height: Ref<number>,
  blockType: Ref<BlockType>,
  blockSize: Ref<number>,
  blockPadding: Ref<number>,
  blockRadius: Ref<number>
) {
  const fullCanvasRef = ref<HTMLCanvasElement>()
  const bgCanvasRef = ref<HTMLCanvasElement>()
  const blockCanvasRef = ref<HTMLCanvasElement>()
  let fullCtx: CanvasRenderingContext2D | null = null,
    bgCtx: CanvasRenderingContext2D | null = null,
    blockCtx: CanvasRenderingContext2D | null = null

  const { bulgeR, bulgeOffset, blockRealWidth } = useBlockSize(blockType, blockSize, blockPadding)
  /** 渲染验证码 */
  function render(img: HTMLImageElement, x: number, y: number) {
    renderFullCanvas(fullCtx!, img)
    renderBgCanvas(bgCtx!, img, x, y)
    renderBlockCanvas(blockCtx!, img, x, y)
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
      safePadding: blockPadding.value,
    })
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
    blockRealWidth,
    render,
    clearCanvas,
  }
}
