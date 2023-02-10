<!--
 * @Author: 杨旭
 * @Date: 2023-02-09 17:06:06
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-10 18:50:14
 * @FilePath: \vue-slide-puzzle\src\components\slide-puzzle\Control.vue
 * @Description: 
-->
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import ArrowRight from '../icons/ArrowRight.vue'
import { useEvent } from './useEvent'
import { clamp } from 'lodash-es'

const dragging = ref(false)
const startPosition = {
  clientX: 0,
  left: 0,
}

const tips = reactive({
  status: 'messsage',
  text: '向右拖动滑填充拼图',
})

const slideLeft = ref(0)

function mouseDown(event: MouseEvent) {
  const { clientX } = event
  dragging.value = true
  startPosition.clientX = clientX
  startPosition.left = slideLeft.value
}

useEvent('mousemove', (event: MouseEvent) => {
  if (!dragging.value) return
  const { clientX } = event
  const left = clientX - startPosition.clientX + startPosition.left
  const offset = clamp(left, 0, 320 - 40)

  slideLeft.value = offset
})

useEvent('mouseup', () => {
  if (!dragging.value) return
  dragging.value = false
})
</script>

<template>
  <div class="control" :class="{ 'control--moving': dragging }">
    <div
      class="slide-indicator"
      :style="{
        width: `${slideLeft + 42}px`,
        backgroundColor: 'lightblue',
        borderColor: 'blue',
      }"
    ></div>
    <div
      class="slide"
      :style="{
        left: `${slideLeft}px`,
      }"
      @mousedown="mouseDown"
    >
      <ArrowRight />
    </div>
    <div class="tips">
      <div class="tips__content">
        <span class="tips__text">{{ tips.text }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control {
  position: relative;
  height: 40px;
  border-radius: 2px;
  border: 1px solid #e4e7eb;
  background-color: #f7f9fa;
}

.control--moving {
  .slide {
    color: #fff;
    background-color: #1991fa;
  }
}

.slide-indicator {
  position: absolute;
  top: -1px;
  left: -1px;
  height: 40px;
  border-radius: 2px;
  border: 1px solid transparent;
}

.slide-indicator--success {
  border-color: #52ccba;
  background-color: #d2f4ef;
}

.slide {
  position: absolute;
  width: 40px;
  height: 100%;
  border-radius: 2px;
  color: #333;
  background-color: #fff;
  box-shadow: 0 0 3px rgb(0 0 0 / 30%);
  cursor: pointer;

  transition: background-color 0.2s linear;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
    background-color: #1991fa;
  }
}

.tips {
  padding-left: 40px;
  height: 100%;

  color: #45494c;
  display: flex;
  align-items: center;
}

.tips__content {
  flex-grow: 1;
  text-align: center;

  line-height: 18px;
  user-select: none;
}

.tips__icon {
  width: 12px;
  height: 12px;
  margin-right: 5px;
}
</style>
