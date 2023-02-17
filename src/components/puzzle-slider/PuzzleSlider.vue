<!--
 * @Author: 杨旭
 * @Date: 2023-02-16 13:21:30
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-17 10:31:45
 * @FilePath: \vue-slide-puzzle\src\components\puzzle-slider\PuzzleSlider.vue
 * @Description: 拼图滑动验证
-->
<script lang="ts" setup>
import Loading from './Loading.vue'
import BtnList from './BtnList.vue'
import IconArrowRight from '../icons/ArrowRight.vue'
import IconClose from '../icons/Close.vue'
import IconCheck from '../icons/Check.vue'

import type { PropType } from 'vue'
import type { BlockType } from './types'

import { ref, computed, onMounted } from 'vue'
import { clamp, loadImg, random } from './utils'
import { useEvent } from './useEvent'

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
})

const emits = defineEmits(['success', 'error'])

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

/** 初始化拼图 */
async function initPuzzle() {
  !fullCtx && (fullCtx = fullCanvasRef.value!.getContext('2d'))
  !bgCtx && (bgCtx = bgCanvasRef.value!.getContext('2d'))
  !blockCtx && (blockCtx = blockCanvasRef.value!.getContext('2d'))

  blockLeft.value = 0
  slideLeft.value = 0
  startPosition.clientX = 0
  startPosition.left = 0
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
  try {
    const img = await loadImg(imgUrl)
    drawFullImg(img)
    drawBg(bgCtx!, img, randomX, randomY)
    drawBlock(blockCtx!, img, randomX, randomY)
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
/** 图片加载中 */
const loading = ref(false)

/** 刷新图片 */
function refreshImg() {
  initPuzzle()
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
/** 滑块位置 */
const slideLeft = ref(0)
/* 拖拽中 */
const dragging = ref(false)
/* 记录开始坐标 */
const startPosition = {
  /* 鼠标点击的开始位置 */
  clientX: 0,
  /* 滑块的开始位置 */
  left: 0,
}

/** 开始拖动 */
function handleStartDrag(event: MouseEvent) {
  const { clientX } = event
  dragging.value = true
  startPosition.clientX = clientX
  startPosition.left = slideLeft.value
}
/** 拖动 */
function handleDrag(event: MouseEvent) {
  if (!dragging.value) return
  const { clientX } = event
  const left = clientX - startPosition.clientX + startPosition.left
  const maxLeft = props.width - props.sliderSize
  const value = clamp(left, 0, maxLeft)
  slideLeft.value = value
  const percent = value / maxLeft
  blockLeft.value = percent * (props.width - blockRealSize.value)
}

const succeed = ref(false)
const failed = ref(false)
const animate = ref(false)
const maxError = ref(false)
/** 结束拖动 */
function handleStopDrag() {
  if (!dragging.value) return
  dragging.value = false

  if (Math.abs(answer - blockLeft.value) < props.range) {
    emits('success')
    errorTimes = 0
    succeed.value = true
  } else {
    emits('error')
    errorTimes += 1
    if (errorTimes >= maxErrorTimes) {
      maxError.value = true
    } else {
      failed.value = true

      setTimeout(() => {
        animate.value = true
        failed.value = false
        initPuzzle()
      }, 100)

      setTimeout(() => {
        animate.value = false
      }, 400)
    }
  }
}
useEvent('mousemove', handleDrag)
useEvent('mouseup', handleStopDrag)
useEvent('blur', handleStopDrag)
/** 滑块图标 */
const sliderIcon = computed(() => {
  if (succeed.value) {
    return IconCheck
  }
  if (failed.value) {
    return IconClose
  }
  return IconArrowRight
})
/** 滑动提示信息 */
const sliderTipText = computed(() => {
  if (succeed.value || failed.value) {
    return ''
  }
  if (maxError.value) {
    return props.maxErrorText
  }
  return props.tipText
})

const maxErrorTimes = 5
let errorTimes = 0

function handleClickRetry() {
  if (maxError.value) {
    initPuzzle()
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
            opacity: succeed ? '1' : '',
          }"
        ></canvas>
      </div>

      <div v-show="loading" class="load-container">
        <Loading />
      </div>

      <div class="top-container">
        <BtnList :show-refresh="!succeed" @refresh="refreshImg" />
      </div>
    </div>

    <div class="puzzle-control">
      <div
        class="slider"
        :class="{ 'slider--error': maxError }"
        :style="{
          height: `${sliderSize}px`,
          borderRadius: `${borderRadius}px`,
        }"
        @click="handleClickRetry"
      >
        <div
          v-show="!maxError"
          class="slider-bar"
          :class="{
            'slider-bar--dragging': dragging,
            'slider-bar--waiting': !succeed && !failed,
            'slider-bar--succeed': succeed,
            'slider-bar--failed': failed,
            'slider-bar--animate': animate,
          }"
          :style="{
            width: `${sliderSize + slideLeft}px`,
            height: `${sliderSize}px`,
            borderRadius: `${borderRadius}px`,
          }"
        >
          <div
            class="slider-btn"
            :style="{
              width: `${sliderSize - 2}px`,
              borderRadius: `${borderRadius}px`,
            }"
            @mousedown="handleStartDrag"
          >
            <component :is="sliderIcon" />
          </div>
        </div>
        <div
          v-show="!dragging"
          class="slider-tip"
          :style="{
            paddingLeft: `${maxError ? 0 : sliderSize - 1}px`,
          }"
        >
          <IconClose v-if="maxError" class="slider-tip_icon" />
          <span class="slider-tip_text">{{ sliderTipText }}</span>
        </div>
      </div>
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

.slider {
  position: relative;
  color: #45494c;
  border: 1px solid #e4e7eb;
  background-color: #f7f9fa;
  box-sizing: border-box;
}

.slider--error {
  border-color: #f57a7a;
  background-color: #fce1e1;
  color: #f57a7a;
  cursor: pointer;
}

.slider-bar {
  position: absolute;
  box-sizing: border-box;
  top: -1px;
  left: -1px;
  border: 1px solid transparent;
}

.slider-bar--dragging {
  border-color: #1991fa;
  background-color: #d1e9fe;

  .slider-btn {
    color: #fff;
    background-color: #1991fa;
  }
}

.slider-bar--succeed {
  border-color: #52ccba;
  background-color: #d2f4ef;

  .slider-btn {
    color: #fff;
    background-color: #52ccba;
  }
}
.slider-bar--failed {
  border-color: #f57a7a;
  background-color: #fce1e1;

  .slider-btn {
    color: #fff;
    background-color: #f57a7a;
  }
}

.slider-bar--animate {
  transition: width 0.3s ease-out;
}

.slider-bar--waiting {
  .slider-btn:hover {
    color: #fff;
    background-color: #1991fa;
  }
}

.slider-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  color: #333;
  background-color: #fff;
  box-shadow: 0 0 3px rgb(0 0 0 / 30%);
  cursor: pointer;

  transition: background-color 0.2s linear;

  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-tip {
  height: 100%;

  display: flex;
  align-items: center;

  justify-content: center;
}

.slider-tip_text {
  line-height: 18px;
  user-select: none;
}

.slider-tip_icon {
  vertical-align: -0.15em;
  display: inline-block;

  margin-right: 5px;
}
</style>
