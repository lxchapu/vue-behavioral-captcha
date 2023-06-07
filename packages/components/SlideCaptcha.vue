<!--
 * @Author: 杨旭
 * @Date: 2023-03-06 09:24:33
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-03-06 17:18:51
 * @FilePath: \zyx-components\packages\components\captcha\src\SlideCaptcha.vue
 * @Description: 滑动验证码
-->
<script lang="ts" setup>
import SlideControl from './components/SlideControl.vue'

import type { CaptchaControlState } from '../types'

import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  width: { type: Number, default: 320 },
  borderRadius: { type: Number, default: 2 },
  sliderSize: { type: Number, default: 40 },
  tipText: { type: String, default: '向右滑动' },
  maxErrorText: { type: String, default: '失败过多，点击重试' },
})

const emits = defineEmits(['success', 'fail'])

const sliderState = ref<CaptchaControlState>('ready')
const sliderLeft = ref(0)

let errorTimes = 0
const maxError = ref(false)

const sliderTipText = computed(() => {
  if (maxError.value) return props.maxErrorText
  return props.tipText
})

/** 刷新验证码 */
function refreshCaptcha() {
  /* reset */
  maxError.value = false
  sliderLeft.value = 0
  sliderState.value = 'ready'
}
/** 校验验证码是否通过 */
function checkCaptcha(standardVariance: number) {
  if (sliderLeft.value === 100 && standardVariance > 0) {
    sliderState.value = 'success'
    errorTimes = 0
    emits('success')
  } else {
    sliderState.value = 'error'
    errorTimes += 1
    emits('fail')

    setTimeout(() => {
      if (errorTimes < 5) {
        refreshCaptcha()
      } else {
        maxError.value = true
      }
    }, 200)
  }
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <div
    class="z-slide-captcha"
    :style="{
      width: `${width}px`,
    }"
  >
    <SlideControl
      v-model="sliderLeft"
      :width="width"
      :height="sliderSize"
      :border-radius="borderRadius"
      :state="sliderState"
      :tip-text="sliderTipText"
      :max-error="maxError"
      @finish="checkCaptcha"
      @refresh="refreshCaptcha"
    />
  </div>
</template>
