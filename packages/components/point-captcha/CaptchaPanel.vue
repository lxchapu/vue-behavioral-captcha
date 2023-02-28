<script lang="ts" setup>
import LoadContainer from '../LoadContainer.vue'
import BtnList from '../BtnList.vue'
import Point from './Point.vue'

import type { PropType } from 'vue'
import type { TextItem } from './types'

import { onMounted, reactive, ref, computed } from 'vue'
import { loadImg } from '@/utils'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  borderRadius: { type: Number, required: true },
  textList: { type: Array as PropType<TextItem[]>, required: true },
  bgImg: { type: String, required: true },
  disabled: { type: Boolean, required: true },
  loadingText: { type: String, required: true },
  refreshBtnVisible: { type: Boolean, required: true },
})

const emits = defineEmits(['point', 'refresh'])

const imgCanvasRef = ref<HTMLCanvasElement>()
const imgContainerRef = ref<HTMLDivElement>()
let imgCtx: CanvasRenderingContext2D | null = null
/** 状态 */
const state = reactive({
  loadError: '',
  loading: false,
})
/** 绘制点 */
const pointList = ref<{ x: number; y: number }[]>([])
/** 功能按钮 */
const btnGroup = computed(() => {
  return [
    {
      title: '刷新',
      visible: props.refreshBtnVisible,
      disabled: state.loading,
      event: handleRefresh,
    },
  ]
})
/** 绘制验证码 */
async function drawCaptcha() {
  const { width, height } = props
  /* 重置状态 */
  state.loadError = ''
  state.loading = true
  pointList.value = []
  /* 清空画布 */
  imgCtx!.clearRect(0, 0, width, height)

  try {
    /* 加载图片 */
    const img = await loadImg(props.bgImg)
    /* 绘制背景 */
    imgCtx!.drawImage(img, 0, 0, width, height, 0, 0, width, height)
    /* 绘制文字 */
    props.textList.forEach((item) => {
      drawText(imgCtx!, item)
    })
  } catch (error: any) {
    state.loadError = error
    throw error
  } finally {
    state.loading = false
  }
}
/** 绘制文字 */
function drawText(ctx: CanvasRenderingContext2D, text: TextItem) {
  ctx.save()

  const r = text.fontSize / 2
  ctx.translate(text.x + r, text.y + r)
  ctx.rotate((Math.PI / 180) * text.angle)
  ctx.fillStyle = text.color
  ctx.textAlign = 'start'
  ctx.textBaseline = 'top'
  ctx.font = `bold ${text.fontSize}px sans-serif`
  ctx.fillText(text.text, -r, -r)

  ctx.restore()
}

defineExpose({
  drawCaptcha,
})

onMounted(() => {
  imgCtx = imgCanvasRef.value!.getContext('2d')
})

/** 点击画布 */
function handleClickCanvas(event: MouseEvent) {
  if (props.disabled || state.loading || state.loadError) return

  const { left, top } = imgContainerRef.value!.getBoundingClientRect()
  pointList.value.push({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  emits('point', pointList.value)
}
/** 撤销点击 */
function handleClickPoint(index: number, event: MouseEvent) {
  if (props.disabled || state.loading || state.loadError) return

  if (index === pointList.value.length - 1) {
    pointList.value.pop()
    event.stopPropagation()
  }
}
/** 刷新验证码 */
function handleRefresh() {
  emits('refresh')
}
</script>

<template>
  <div
    class="captcha-panel"
    :style="{
      height: `${height}px`,
      borderRadius: `${borderRadius}px`,
    }"
  >
    <div ref="imgContainerRef" class="img-container" @click="handleClickCanvas">
      <canvas ref="imgCanvasRef" class="img" :width="width" :height="height"></canvas>

      <Point
        v-for="(item, index) in pointList"
        :key="index"
        :value="index + 1"
        :style="{
          left: `${item.x}px`,
          top: `${item.y}px`,
        }"
        @click="handleClickPoint(index, $event)"
      />
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

.img-container {
  position: relative;
  overflow: hidden;
}

.img {
  vertical-align: top;
}

.point {
  position: absolute;
  cursor: pointer;
  transform: translate(-50%, -100%);
}

.load-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
}

.top-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
}
</style>