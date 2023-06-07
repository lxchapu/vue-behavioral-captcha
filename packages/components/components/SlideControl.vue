<!--
 * @Author: 杨旭
 * @Date: 2023-02-24 11:28:26
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-06-07 09:30:35
 * @FilePath: \vue-behavioral-captcha\packages\components\components\SlideControl.vue
 * @Description: 滑动控制器
-->
<script lang="ts" setup>
import { IconArrowRight, IconClose, IconCheck } from './icons'

import type { PropType } from 'vue'
import type { CaptchaControlState } from '../../types'

import { ref, computed } from 'vue'
import { clamp, getStandardVariance } from '../../utils'
import { useEvent } from '../../hooks'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  borderRadius: { type: Number, required: true },
  tipText: { type: String, required: true },
  state: { type: String as PropType<CaptchaControlState>, default: 'ready' },
  maxError: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emits = defineEmits(['update:modelValue', 'refresh', 'finish'])

const disabled = computed(
  () => props.disabled || props.state === 'success' || props.state === 'error'
)
/* 拖拽中 */
const dragging = ref(false)
/* 记录开始信息 */
const start = {
  /* 鼠标点击的开始位置 */
  pageX: 0,
  /* 起始值 */
  value: 0,
}
/** 记录滑动的 y 坐标 */
let yLogs: number[] = []

const sliderBarWidth = computed(() => {
  const { modelValue, min, max, height, width } = props
  return ((modelValue - min) / (max - min)) * (width - height) + height
})

/** 滑块图标 */
const sliderIcon = computed(() => {
  if (props.state === 'success') {
    return IconCheck
  }
  if (props.state === 'error') {
    return IconClose
  }
  return IconArrowRight
})
/** 滑动提示信息 */
const sliderTipText = computed(() => {
  return dragging.value || props.state === 'success' ? '' : props.tipText
})
/** 获取点击位置 pageX */
function getPageX(event: MouseEvent | TouchEvent) {
  if ('pageX' in event) {
    return event.pageX
  } else {
    return event.changedTouches[0].pageX
  }
}
/** 获取点击位置 pageY */
function getPageY(event: MouseEvent | TouchEvent) {
  if ('pageY' in event) {
    return event.pageY
  } else {
    return event.changedTouches[0].pageY
  }
}

/** 开始拖动 */
function handleStartDrag(event: MouseEvent | TouchEvent) {
  if (disabled.value) return

  dragging.value = true
  start.pageX = getPageX(event)
  start.value = props.modelValue
  yLogs = []
}
/** 拖动 */
function handleDrag(event: MouseEvent | TouchEvent) {
  if (!dragging.value || disabled.value) return

  const { min, max, height, width } = props
  const pageX = getPageX(event)
  const pageY = getPageY(event)
  yLogs.push(pageY)
  const v = ((pageX - start.pageX) / (width - height)) * (max - min)
  const value = clamp(v + start.value, min, max)
  emits('update:modelValue', value)
}
/** 结束拖动 */
function handleStopDrag() {
  if (!dragging.value || disabled.value) return

  dragging.value = false
  const standardVariance = getStandardVariance(yLogs)
  emits('finish', standardVariance)
}

/** 点击重试 */
function handleClickRetry() {
  if (props.maxError) {
    emits('refresh')
  }
}

useEvent('mousemove', handleDrag)
useEvent('mouseup', handleStopDrag)
useEvent('touchmove', handleDrag)
useEvent('touchend', handleStopDrag)
useEvent('blur', handleStopDrag)
</script>

<template>
  <div
    class="slide-control"
    :class="{ 'slide-control--error': maxError }"
    :style="{
      height: `${height}px`,
      borderRadius: `${borderRadius}px`,
    }"
  >
    <div
      v-show="!maxError"
      class="slider-bar"
      :class="{
        [`slider-bar--${state}`]: true,
        'slider-bar--moving': dragging,
      }"
      :style="{
        width: `${sliderBarWidth}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
      }"
    >
      <div
        class="slider-btn"
        :class="{
          'slider-btn--disabled': disabled,
        }"
        :style="{
          width: `${height - 2}px`,
          borderRadius: `${borderRadius}px`,
        }"
        @mousedown="handleStartDrag"
        @touchstart="handleStartDrag"
      >
        <component :is="sliderIcon" />
      </div>
    </div>
    <div
      v-show="sliderTipText"
      class="slider-tip"
      :style="{
        paddingLeft: `${maxError ? 0 : height - 2}px`,
      }"
      @click="handleClickRetry"
    >
      <IconClose v-if="maxError" class="slider-tip__icon" />
      <span class="slider-tip__text">{{ sliderTipText }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.slide-control {
  position: relative;
  box-sizing: border-box;
  color: #45494c;
  background-color: #f7f9fa;
  border: 1px solid #e4e7eb;
}

.slide-control--error {
  color: #f57a7a;
  cursor: pointer;
  background-color: #fce1e1;
  border-color: #f57a7a;
}

.slider-bar {
  position: absolute;
  top: -1px;
  left: -1px;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: width 0.3s ease-out;
}

.slider-btn {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #333;
  cursor: pointer;
  background-color: #fff;
  box-shadow: 0 0 3px rgb(0 0 0 / 30%);
  transition: background-color 0.2s linear;
}

.slider-bar--moving {
  background-color: #d1e9fe;
  border-color: #1991fa;
  transition: unset;

  .slider-btn {
    color: #fff;
    background-color: #1991fa;
  }
}

.slider-bar--success {
  background-color: #d2f4ef;
  border-color: #52ccba;

  .slider-btn {
    color: #fff;
    background-color: #52ccba;
  }
}

.slider-bar--error {
  background-color: #fce1e1;
  border-color: #f57a7a;

  .slider-btn {
    color: #fff;
    background-color: #f57a7a;
  }
}

.slider-bar--ready {
  .slider-btn:not(.slider-btn--disabled):hover {
    color: #fff;
    background-color: #1991fa;
  }
}

.slider-btn--disabled {
  cursor: not-allowed;
}

.slider-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.slider-tip__text {
  line-height: 18px;
  user-select: none;
}

.slider-tip__icon {
  display: inline-block;
  margin-right: 5px;
  vertical-align: -0.15em;
}
</style>
