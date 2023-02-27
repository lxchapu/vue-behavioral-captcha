<script lang="ts" setup>
import LoadContainer from '../LoadContainer.vue'
import BtnList from '../BtnList.vue'

import { onMounted, toRef, type PropType } from 'vue'

import { ref, computed, reactive } from 'vue'
import { loadImg } from '@/utils'
import { usePuzzleSize } from './usePuzzleSize'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  borderRadius: { type: Number, required: true },
  safePadding: { type: Number, required: true },
  blockSize: { type: Number, required: true },
  blockType: { type: String as PropType<'jigsaw' | 'suqare'>, required: true },
  blockPadding: { type: Number, default: 2 },
  blockRadius: { type: Number, default: 5 },
  loadingText: { type: String, required: true },
  done: { type: Boolean, required: true },
  img: { type: String, required: true },
  blockLeft: { type: Number, required: true },
})

const emits = defineEmits(['refresh'])

const fullCanvasRef = ref<HTMLCanvasElement>()
const bgCanvasRef = ref<HTMLCanvasElement>()
const blockCanvasRef = ref<HTMLCanvasElement>()
let fullCtx: CanvasRenderingContext2D | null = null,
  bgCtx: CanvasRenderingContext2D | null = null,
  blockCtx: CanvasRenderingContext2D | null = null
/** 状态 */
const state = reactive({
  loadError: '',
  loading: false,
})

const { bulgeOffset, offsetAngle, blockRealWidth, bulgeR, bulgeSize } = usePuzzleSize(
  toRef(props, 'blockType'),
  toRef(props, 'blockSize'),
  props.blockPadding
)

const btnGroup = computed(() => {
  return [
    {
      title: '刷新',
      visible: !props.done,
      disabled: state.loading,
      event: handleRefresh,
    },
  ]
})

/** 清空画布 */
function clearCanvas() {
  const { width, height } = props
  fullCtx!.clearRect(0, 0, width, height)
  bgCtx!.clearRect(0, 0, width, height)
  blockCtx!.clearRect(0, 0, blockRealWidth.value, height)
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
  const w = blockRealWidth.value
  const h = props.height

  ctx.save()
  /* 绘制剪切区域和外阴影 */
  drawBlockPath(ctx, {
    x: props.blockPadding,
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
  ctx!.drawImage(img, x - props.blockPadding, 0, w, h, 0, 0, w, h)
  /* 绘制内阴影 */
  ctx.globalCompositeOperation = 'source-atop'
  drawBlockPath(ctx, {
    x: props.blockPadding,
    y,
  })
  ctx.arc(
    props.blockPadding + Math.ceil(props.blockSize / 2),
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

  if (props.blockType === 'jigsaw') {
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
  } else {
    const R = props.blockRadius
    ctx.beginPath()
    ctx.moveTo(x + R, y)
    ctx.arcTo(x + size, y, x + size, y + size, R)
    ctx.arcTo(x + size, y + size, x, y + size, R)
    ctx.arcTo(x, y + size, x, y, R)
    ctx.arcTo(x, y, x + size, y, R)
  }
}

/** 点击刷新 */
function handleRefresh() {
  emits('refresh')
}
/** 绘制验证码 */
async function drawCaptcha(x: number, y: number) {
  /* 重置状态 */
  state.loadError = ''
  state.loading = true
  /* 清空画布 */
  clearCanvas()
  try {
    const img = await loadImg(props.img)
    drawFullImg(img)
    drawBg(bgCtx!, img, x, y)
    drawBlock(blockCtx!, img, x, y)
  } catch (error: any) {
    state.loadError = error
    throw error
  } finally {
    state.loading = false
  }
}

defineExpose({
  drawCaptcha,
})

onMounted(() => {
  fullCtx = fullCanvasRef.value!.getContext('2d')
  bgCtx = bgCanvasRef.value!.getContext('2d')
  blockCtx = blockCanvasRef.value!.getContext('2d')
})
</script>

<template>
  <div
    class="captcha-panel"
    :style="{
      height: `${height}px`,
      borderRadius: `${borderRadius}px`,
    }"
  >
    <div class="img-container">
      <!-- 残缺的背景图 -->
      <canvas ref="bgCanvasRef" class="img-bg" :width="width" :height="height"></canvas>
      <!-- 拼图块 -->
      <canvas
        ref="blockCanvasRef"
        class="img-block"
        :width="blockRealWidth"
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
          opacity: props.done ? '1' : '',
        }"
      ></canvas>
    </div>

    <LoadContainer
      v-show="state.loading || state.loadError"
      :state="state.loading ? 'loading' : 'error'"
      :text="state.loading ? loadingText : state.loadError"
    />

    <div class="top-container">
      <BtnList :data="btnGroup" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.captcha-panel {
  position: relative;
  overflow: hidden;
}

.load-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
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
  top: 0;
  right: 0;
  z-index: 20;
}
</style>
