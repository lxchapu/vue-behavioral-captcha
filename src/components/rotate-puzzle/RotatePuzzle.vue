<script lang="ts" setup>
import { Slider } from '../slide-puzzle'
import Loading from '../slide-puzzle/Loading.vue'
import Error from '../slide-puzzle/Error.vue'

import { onMounted, type PropType } from 'vue'
import type { SliderState } from '../slide-puzzle/types'

import { ref, computed } from 'vue'
import { loadImg, random } from '@/utils'

const props = defineProps({
  width: { type: Number, default: 320 },
  range: { type: Number, default: 3 },
  sliderSize: { type: Number, default: 40 },
  borderRadius: { type: Number, default: 2 },
  imgList: {
    type: Array as PropType<string[]>,
    default: () => [
      'https://picsum.photos/id/20/320.webp',
      'https://picsum.photos/id/30/320.webp',
      'https://picsum.photos/id/40/320.webp',
      'https://picsum.photos/id/50/320.webp',
      'https://picsum.photos/id/60/320.webp',
    ],
  },
  tipText: { type: String, default: '拖动滑块旋转到正确位置' },
  maxErrorText: { type: String, default: '失败过多，点击重试' },
  loadingText: { type: String, default: '加载中...' },
})

const emits = defineEmits(['success', 'fail'])

const imgAngle = ref(0)
const sliderState = ref<SliderState>('ready')
const loading = ref(false)
const maxError = ref(false)
const errorText = ref('')
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
async function finish() {
  if (Math.abs(answer + imgAngle.value - 360) < props.range) {
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

async function refreshImg() {
  await initPuzzle()
  sliderState.value = 'ready'
}

let answer = 0

async function initPuzzle() {
  const { imgList, width } = props
  const index = random(0, imgList.length)
  loading.value = true

  imgCtx!.clearRect(0, 0, width, width)
  const r = width / 2

  maxError.value = false
  answer = random(10, 350)
  imgAngle.value = 0

  try {
    const img = await loadImg(imgList[index])

    const imgMin = Math.min(img.width, img.height)

    imgCtx!.arc(r, r, r, 0, Math.PI * 2)
    imgCtx!.clip()

    imgCtx!.save()
    imgCtx!.translate(r, r)
    imgCtx!.rotate((Math.PI / 180) * answer)

    imgCtx!.drawImage(img, 0, 0, imgMin, imgMin, -r, -r, width, width)

    imgCtx!.restore()
  } catch (error: any) {
    errorText.value = error
  } finally {
    loading.value = false
  }
}

const imgCanvasRef = ref<HTMLCanvasElement>()
let imgCtx: CanvasRenderingContext2D | null = null

onMounted(() => {
  imgCtx = imgCanvasRef.value!.getContext('2d')
  initPuzzle()
})
</script>

<template>
  <div
    class="rotate-puzzle"
    :style="{
      width: `${width}px`,
    }"
  >
    <div
      class="puzzle-panel"
      :style="{
        width: `${width}px`,
        height: `${width}px`,
      }"
    >
      <div class="img-container">
        <canvas
          ref="imgCanvasRef"
          class="img"
          :width="width"
          :height="width"
          :style="{
            transform: `rotate(${imgAngle}deg)`,
          }"
        >
        </canvas>
      </div>

      <div class="load-container">
        <Loading v-if="loading" :text="loadingText" />
        <Error v-else-if="errorText" :text="errorText" />
      </div>
    </div>
    <div class="puzzle-control">
      <Slider
        v-model="imgAngle"
        :width="width"
        :border-radius="borderRadius"
        :max="360"
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
.puzzle-panel {
  position: relative;
  margin-bottom: 15px;
}

.img-container {
  position: relative;
}

.img {
  vertical-align: top;
}

.load-container {
  position: absolute;
  z-index: 10;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}
</style>
