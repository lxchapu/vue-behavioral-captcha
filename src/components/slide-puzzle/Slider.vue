<script lang="ts" setup>
import { IconArrowRight, IconClose, IconCheck } from '../icons'

import type { PropType } from 'vue'
import type { SliderState } from './types'

import { ref, computed } from 'vue'
import { clamp } from './utils'
import { useEvent } from './useEvent'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  width: { type: Number, required: true },
  borderRadius: { type: Number, required: true },
  /** 滑块大小 */
  size: { type: Number, required: true },
  tipText: { type: String, required: true },
  state: { type: String as PropType<SliderState>, default: 'ready' },
  maxError: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
})

const emits = defineEmits(['update:modelValue', 'refresh', 'finish'])

const disable = computed(() => props.disable || props.state === 'pass' || props.state === 'error')
/* 拖拽中 */
const dragging = ref(false)
/* 记录开始信息 */
const start = {
  /* 鼠标点击的开始位置 */
  clientX: 0,
  /* 起始值 */
  value: 0,
}

const sliderBarWidth = computed(() => {
  const { modelValue, min, max, size, width } = props
  return ((modelValue - min) / (max - min)) * (width - size) + size
})

/** 滑块图标 */
const sliderIcon = computed(() => {
  if (props.state === 'pass') {
    return IconCheck
  }
  if (props.state === 'error') {
    return IconClose
  }
  return IconArrowRight
})
/** 滑动提示信息 */
const sliderTipText = computed(() => {
  return dragging.value || props.state === 'pass' ? '' : props.tipText
})

function getPageX(event: MouseEvent | TouchEvent) {
  if ('pageX' in event) {
    return event.pageX
  } else {
    return event.changedTouches[0].pageX
  }
}

/** 开始拖动 */
function handleStartDrag(event: MouseEvent | TouchEvent) {
  if (disable.value) return

  const clientX = getPageX(event)
  dragging.value = true
  start.clientX = clientX
  start.value = props.modelValue
}
/** 拖动 */
function handleDrag(event: MouseEvent | TouchEvent) {
  if (!dragging.value || disable.value) return

  const clientX = getPageX(event)
  const { min, max, size, width } = props
  const v = ((clientX - start.clientX) / (width - size)) * (max - min)
  const value = clamp(v + start.value, min, max)
  emits('update:modelValue', value)
}
/** 结束拖动 */
function handleStopDrag() {
  if (!dragging.value || disable.value) return
  dragging.value = false
  emits('finish')
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
    class="slider"
    :class="{ 'slider--error': maxError }"
    :style="{
      width: `${width}px`,
      height: `${size}px`,
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
        height: `${size}px`,
        borderRadius: `${borderRadius}px`,
      }"
    >
      <div
        class="slider-btn"
        :class="{
          'slider-btn--disable': disable,
        }"
        :style="{
          width: `${size - 2}px`,
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
        paddingLeft: `${maxError ? 0 : size - 2}px`,
      }"
      @click="handleClickRetry"
    >
      <IconClose v-if="maxError" class="slider-tip_icon" />
      <span class="slider-tip_text">{{ sliderTipText }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

  transition: width 0.3s ease-out;
}

.slider-bar--ready {
  .slider-btn:not(.slider-btn--disable):hover {
    color: #fff;
    background-color: #1991fa;
  }
}

.slider-bar--moving {
  border-color: #1991fa;
  background-color: #d1e9fe;
  transition: unset;

  .slider-btn {
    color: #fff;
    background-color: #1991fa;
  }
}

.slider-bar--pass {
  border-color: #52ccba;
  background-color: #d2f4ef;

  .slider-btn {
    color: #fff;
    background-color: #52ccba;
  }
}
.slider-bar--error {
  border-color: #f57a7a;
  background-color: #fce1e1;

  .slider-btn {
    color: #fff;
    background-color: #f57a7a;
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

.slider-btn--disable {
  cursor: not-allowed;
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
