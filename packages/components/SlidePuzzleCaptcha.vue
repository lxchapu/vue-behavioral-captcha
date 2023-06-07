<!--
 * @Author: 杨旭
 * @Date: 2023-03-01 14:03:50
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-06-07 09:29:48
 * @FilePath: \vue-behavioral-captcha\packages\components\SlidePuzzleCaptcha.vue
 * @Description: 滑动拼图验证码
-->
<script lang="ts" setup>
import SlideControl from './components/SlideControl.vue'
import CaptchaContainer from './components/CaptchaContainer.vue'

import type { PropType } from 'vue'
import type { PuzzleBlockType, CaptchaControlState } from '../types'

import { ref, computed, onMounted, toRef } from 'vue'
import { useSlidePuzzleCaptcha } from '../hooks'

const props = defineProps({
  /** 画布宽度 */
  width: { type: Number, default: 320 },
  height: { type: Number, default: 160 },
  borderRadius: { type: Number, default: 2 },
  blockSize: { type: Number, default: 40 },
  blockType: { type: String as PropType<PuzzleBlockType>, default: 'jigsaw' },
  blockRadius: { type: Number, default: 5 },
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
  loadingText: { type: String, default: '加载中…' },
})

const emits = defineEmits(['success', 'fail'])

const {
  fullCanvasRef,
  bgCanvasRef,
  blockCanvasRef,
  blockLeft,
  state,
  blockRealWidth,
  initCaptcha,
  validateCaptcha,
} = useSlidePuzzleCaptcha(
  toRef(props, 'width'),
  toRef(props, 'height'),
  toRef(props, 'blockType'),
  toRef(props, 'blockSize'),
  toRef(props, 'blockRadius'),
  toRef(props, 'imgList')
)

const sliderState = ref<CaptchaControlState>('ready')

let errorTimes = 0
const maxError = ref(false)

const sliderTipText = computed(() => {
  if (state.loading) return props.loadingText
  if (state.loadingError) return state.loadingError
  if (maxError.value) return props.maxErrorText
  return props.tipText
})

const refreshVisible = computed(() => sliderState.value !== 'success')

const refreshDisabled = computed(() => state.loading)

/** 滑动的最大距离 */
const sliderMax = computed(() => props.width - blockRealWidth.value)

/** 刷新验证码 */
async function refreshCaptcha() {
  /* reset */
  maxError.value = false
  try {
    await initCaptcha()
    sliderState.value = 'ready'
  } catch {
    sliderState.value = 'error'
  }
}
/** 校验验证码是否通过 */
function checkCaptcha() {
  const pass = validateCaptcha(props.range)
  if (pass) {
    sliderState.value = 'success'
    errorTimes = 0
    emits('success')
  } else {
    sliderState.value = 'error'
    errorTimes += 1
    emits('fail')
    if (errorTimes < 5) {
      refreshCaptcha()
    } else {
      maxError.value = true
    }
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <div
    class="z-slide-puzzle-captcha"
    :style="{
      width: `${width}px`,
    }"
  >
    <CaptchaContainer
      :width="width"
      :height="height"
      :border-radius="borderRadius"
      :loading="state.loading"
      :loading-error="state.loadingError"
      :loading-text="loadingText"
      :refresh-visible="refreshVisible"
      :refresh-disabled="refreshDisabled"
      @refresh="refreshCaptcha"
    >
      <!-- 残缺的背景图 -->
      <canvas ref="bgCanvasRef" class="canvas-bg" :width="width" :height="height"></canvas>
      <!-- 拼图块 -->
      <canvas
        ref="blockCanvasRef"
        class="canvas-block"
        :width="blockRealWidth"
        :height="height"
        :style="{
          left: `${blockLeft}px`,
        }"
      ></canvas>
      <!-- 完整的图片 -->
      <canvas
        ref="fullCanvasRef"
        class="canvas-full"
        :width="width"
        :height="height"
        :style="{
          opacity: sliderState === 'success' ? '1' : '',
        }"
      ></canvas>
    </CaptchaContainer>

    <SlideControl
      v-model="blockLeft"
      :width="width"
      :height="sliderSize"
      :border-radius="borderRadius"
      :max="sliderMax"
      :state="sliderState"
      :tip-text="sliderTipText"
      :max-error="maxError"
      :disabled="state.loading"
      @finish="checkCaptcha"
      @refresh="refreshCaptcha"
    />
  </div>
</template>

<style lang="scss" scoped>
.captcha-container {
  margin-bottom: 15px;
}

.canvas-bg {
  vertical-align: top;
}

.canvas-full,
.canvas-block {
  position: absolute;
  top: 0;
  left: 0;
}

.canvas-block {
  z-index: 1;
}

.canvas-full {
  z-index: 2;
  opacity: 0;
  transition: opacity 0.6s ease-out;
}
</style>
