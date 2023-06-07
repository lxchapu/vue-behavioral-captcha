<!--
 * @Author: 杨旭
 * @Date: 2023-03-01 14:04:54
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-06-07 09:30:00
 * @FilePath: \vue-behavioral-captcha\packages\components\RotateCaptcha.vue
 * @Description: 旋转验证码
-->
<script lang="ts" setup>
import SlideControl from './components/SlideControl.vue'
import CaptchaContainer from './components/CaptchaContainer.vue'

import type { PropType } from 'vue'
import type { CaptchaControlState } from '../types'

import { ref, computed, onMounted, toRef } from 'vue'
import { useRotateCaptcha } from '../hooks'

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
  loadingText: { type: String, default: '加载中…' },
})

const emits = defineEmits(['success', 'fail'])

const { imgCanvasRef, state, imgAngle, initCaptcha, validateCaptcha } = useRotateCaptcha(
  toRef(props, 'width'),
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
    class="z-rotate-captcha"
    :style="{
      width: `${width}px`,
    }"
  >
    <CaptchaContainer
      :width="width"
      :height="width"
      border-radius="50%"
      :loading="state.loading"
      :loading-error="state.loadingError"
      :loading-text="loadingText"
      @refresh="refreshCaptcha"
    >
      <canvas
        ref="imgCanvasRef"
        class="canvas-img"
        :width="width"
        :height="width"
        :style="{
          transform: `rotate(${imgAngle}deg)`,
        }"
      ></canvas>
    </CaptchaContainer>

    <SlideControl
      v-model="imgAngle"
      :width="width"
      :height="sliderSize"
      :border-radius="borderRadius"
      :max="360"
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

.canvas-img {
  vertical-align: top;
}
</style>
