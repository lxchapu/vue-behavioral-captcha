<script lang="ts" setup>
import Loading from './Loading.vue'
import BtnList from './BtnList.vue'
import Slider from './Slider.vue'
import Error from './Error.vue'

import type { PropType } from 'vue'
import type { BlockType, SliderState } from './types'

import { ref, computed, onMounted } from 'vue'
import { loadImg, random } from './utils'

const props = defineProps({
  /** 画布宽度 */
  width: { type: Number, default: 320 },
  height: { type: Number, default: 160 },
  borderRadius: { type: Number, default: 2 },
  blockSize: { type: Number, default: 40 },
  blockType: { type: String as PropType<BlockType>, default: 'jigsaw' },
  sliderSize: { type: Number, default: 40 },
  range: { type: Number, default: 4 },
  imgList: {
    type: Array as PropType<string[]>,
    default: () => [
      'https://picsum.photos/id/20/320/160.webp',
      'https://picsum.photos/id/30/320/160.webp',
      'https://picsum.photos/id/40/320/160.webp',
      'https://picsum.photos/id/50/320/160.webp',
      'https://picsum.photos/id/60/320/160.webp',
    ],
  },
  tipText: { type: String, default: '向右拖动滑块填充拼图' },
  maxErrorText: { type: String, default: '失败过多，点击重试' },
  loadingText: { type: String, default: '加载中...' },
})

const emits = defineEmits(['success', 'fail'])

/** 安全距离 */
const safePadding = 4

const blockPadding = 2
/** 偏移角弧度 */
const offsetAngle = 0.7
/** 凸起半径 */
const bulgeR = computed(() => props.blockSize / 5)
/** 圆心偏移量 */
const bulgeOffset = computed(() => Math.cos(offsetAngle) * bulgeR.value)
/** 平涂凸起的长度 */
const bulgeSize = computed(() => bulgeR.value + bulgeOffset.value)
/** 拼图块大小 */
const blockBaseSize = computed(() => {
  if (props.blockType === 'jigsaw') {
    return props.blockSize + bulgeSize.value
  } else {
    return props.blockSize
  }
})
/** 拼图块大小加上左右边距 */
const blockRealSize = computed(() => blockBaseSize.value + blockPadding * 2)

/** 获取随机图片地址 */
function getRandomImgUrl() {
  const { imgList } = props
  const index = random(0, imgList.length)
  return imgList[index]
}

const fullCanvasRef = ref<HTMLCanvasElement>()
const bgCanvasRef = ref<HTMLCanvasElement>()
const blockCanvasRef = ref<HTMLCanvasElement>()
let fullCtx: CanvasRenderingContext2D | null = null,
  bgCtx: CanvasRenderingContext2D | null = null,
  blockCtx: CanvasRenderingContext2D | null = null

let answer = 0

const errorText = ref('')

/** 初始化拼图 */
async function initPuzzle() {
  !fullCtx && (fullCtx = fullCanvasRef.value!.getContext('2d'))
  !bgCtx && (bgCtx = bgCanvasRef.value!.getContext('2d'))
  !blockCtx && (blockCtx = blockCanvasRef.value!.getContext('2d'))

  blockLeft.value = 0
  maxError.value = false

  clearCanvas()

  const imgUrl = getRandomImgUrl()
  /** 生成坐标 */
  const randomX = random(
    blockRealSize.value + safePadding,
    props.width - safePadding - blockBaseSize.value
  )
  const randomY = random(safePadding, props.height - safePadding - blockBaseSize.value)

  answer = randomX - blockPadding

  loading.value = true
  errorText.value = ''
  try {
    const img = await loadImg(imgUrl)
    drawFullImg(img)
    drawBg(bgCtx!, img, randomX, randomY)
    drawBlock(blockCtx!, img, randomX, randomY)
  } catch (error: any) {
    errorText.value = error
  } finally {
    loading.value = false
  }
}
/** 清空画布 */
function clearCanvas() {
  const { width, height } = props
  fullCtx!.clearRect(0, 0, width, height)
  bgCtx!.clearRect(0, 0, width, height)
  blockCtx!.clearRect(0, 0, blockRealSize.value, height)
}
/** 绘制完整图片 */
function drawFullImg(img: HTMLImageElement) {
  const { width, height } = props
  fullCtx!.drawImage(img, 0, 0, width, height, 0, 0, width, height)
}
/** 绘制背景 */
function drawBg(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number) {
  const { width: w, height: h, blockSize } = props
  /* 绘制缺口 */
  ctx.save()
  drawBlockPath(ctx, {
    x,
    y,
  })
  ctx.globalAlpha = 0.8
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()
  /* 绘制内阴影 */
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  drawBlockPath(ctx, {
    x,
    y,
  })
  ctx.arc(
    x + Math.ceil(blockSize / 2),
    y + Math.ceil(blockSize / 2),
    blockSize * 1.2,
    0,
    Math.PI * 2,
    true
  )
  ctx.shadowColor = '#000'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowBlur = 16
  ctx.fill()
  ctx.restore()
  /* 绘制背景 */
  ctx.save()
  ctx.globalCompositeOperation = 'destination-over'
  ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h)
  ctx.restore()
}
/** 绘制拼图块 */
function drawBlock(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number) {
  const w = blockRealSize.value
  const h = props.height

  ctx.save()
  /* 绘制剪切区域和外阴影 */
  drawBlockPath(ctx, {
    x: blockPadding,
    y,
  })
  ctx.closePath()
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.shadowColor = '#000'
  ctx.shadowBlur = 3
  ctx.fill()
  ctx.clip()
  /* 绘制剪切图片 */
  ctx!.drawImage(img, x - blockPadding, 0, w, h, 0, 0, w, h)
  /* 绘制内阴影 */
  ctx.globalCompositeOperation = 'source-atop'
  drawBlockPath(ctx, {
    x: blockPadding,
    y,
  })
  ctx.arc(
    blockPadding + Math.ceil(props.blockSize / 2),
    y + Math.ceil(props.blockSize / 2),
    props.blockSize * 1.2,
    0,
    Math.PI * 2,
    true
  )
  ctx.closePath()
  /* 内阴影 */
  ctx.shadowColor = 'rgba(255, 255, 255, .8)'
  ctx.shadowOffsetX = -1
  ctx.shadowOffsetY = -1
  ctx.shadowBlur = 12
  ctx.fillStyle = '#ffffaa'
  ctx.fill()
  ctx.restore()
}
const loading = ref(false)

/** 刷新图片 */
async function refreshImg() {
  await initPuzzle()
  sliderState.value = 'ready'
}

/** 绘制拼图路径 */
function drawBlockPath(
  ctx: CanvasRenderingContext2D,
  option: {
    x: number
    y: number
  }
) {
  const { x, y } = option

  const PI = Math.PI
  const h = bulgeSize.value
  const r = bulgeR.value
  const offset = bulgeOffset.value
  const size = props.blockSize

  ctx.beginPath()
  ctx.moveTo(x, y + h)
  /* top */
  ctx.arc(x + size / 2, y + r, r, 0.5 * PI + offsetAngle, 0.5 * PI - offsetAngle)
  ctx.lineTo(x + size, y + h)
  /* right */
  ctx.arc(x + size + offset, y + h + size / 2, r, PI + offsetAngle, PI - offsetAngle)
  ctx.lineTo(x + size, y + h + size)
  /* bottom */
  ctx.arc(x + size / 2, y + size + r, r, 0.5 * PI - offsetAngle, 0.5 * PI + offsetAngle, true)
  ctx.lineTo(x, y + size + h)
  /* left */
  ctx.lineTo(x, y + h)
}

onMounted(() => {
  initPuzzle()
})
const blockLeft = ref(0)
const sliderMax = computed(() => props.width - blockRealSize.value)
const sliderState = ref<SliderState>('ready')
const sliderTipText = computed(() => {
  if (loading.value) {
    return props.loadingText
  }
  if (errorText.value) {
    return errorText.value
  }
  if (maxError.value) {
    return props.maxErrorText
  }
  return props.tipText
})

let errorTimes = 0
const maxError = ref(false)

async function finish() {
  if (Math.abs(answer - blockLeft.value) < props.range) {
    sliderState.value = 'pass'
    emits('success')
    errorTimes = 0
  } else {
    emits('fail')
    errorTimes += 1
    if (errorTimes >= 5) {
      maxError.value = true
      errorTimes = 0
    } else {
      sliderState.value = 'error'
      await initPuzzle()
      sliderState.value = 'ready'
    }
  }
}
</script>

<template>
  <div
    class="puzzle-slider"
    :style="{
      width: `${width}px`,
    }"
  >
    <div
      class="puzzle-panel"
      :style="{
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
      }"
    >
      <div v-show="!loading" class="img-container">
        <!-- 残缺的背景图 -->
        <canvas ref="bgCanvasRef" class="img-bg" :width="width" :height="height"></canvas>
        <!-- 拼图块 -->
        <canvas
          ref="blockCanvasRef"
          class="img-block"
          :width="blockRealSize"
          :height="height"
          :style="{
            left: `${blockLeft}px`,
          }"
        ></canvas>
        <!-- 完整的图片 -->
        <canvas
          ref="fullCanvasRef"
          class="img-full"
          :width="width"
          :height="height"
          :style="{
            opacity: sliderState === 'pass' ? '1' : '',
          }"
        ></canvas>
      </div>

      <div class="load-container">
        <Loading v-if="loading" :text="loadingText" />
        <Error v-else-if="errorText" :text="errorText" />
      </div>

      <div class="top-container">
        <BtnList :show-refresh="sliderState !== 'pass'" @refresh="refreshImg" />
      </div>
    </div>

    <div class="puzzle-control">
      <Slider
        :width="width"
        :border-radius="borderRadius"
        v-model="blockLeft"
        :max="sliderMax"
        :state="sliderState"
        :size="sliderSize"
        :tip-text="sliderTipText"
        :max-error="maxError"
        :disable="loading"
        @finish="finish"
        @refresh="refreshImg"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.puzzle-slider {
  font-size: 14px;
}

.puzzle-panel {
  position: relative;
  overflow: hidden;
  margin-bottom: 15px;
}

.load-container {
  position: absolute;
  z-index: 10;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.img-container {
  position: relative;
}

.img-bg {
  vertical-align: top;
}

.img-full,
.img-block {
  position: absolute;
  top: 0;
  left: 0;
}
.img-block {
  z-index: 1;
}
.img-full {
  z-index: 2;
  opacity: 0;
  transition: opacity 0.6s ease-out;
}

.top-container {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 20;
}
</style>
