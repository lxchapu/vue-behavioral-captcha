<!--
 * @Author: 杨旭
 * @Date: 2023-03-01 14:21:51
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-06-07 09:32:10
 * @FilePath: \vue-behavioral-captcha\packages\components\components\CaptchaContainer.vue
 * @Description: 验证码显示容器
-->
<script lang="ts" setup>
import { IconImageError, IconLoading, IconReload } from './icons'

import { computed, ref } from 'vue'
import { isNumber } from '../../utils'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  borderRadius: { type: [Number, String], default: 0 },
  loading: { type: Boolean, default: false },
  loadingText: { type: String, default: '加载中…' },
  loadingError: { type: String, default: '加载失败' },
  refreshVisible: { type: Boolean, default: false },
  refreshDisabled: { type: Boolean, default: false },
})

const emits = defineEmits(['refresh', 'click:canvas'])

const loadIcon = computed(() => (props.loading ? IconLoading : IconImageError))

const loadText = computed(() => (props.loading ? props.loadingText : props.loadingError))

const containerStyle = computed(() => {
  const { width, height, borderRadius } = props
  const borderRadiusValue = isNumber(borderRadius) ? `${borderRadius}px` : borderRadius
  return {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: borderRadiusValue,
  }
})

const imgContainerRef = ref<HTMLDivElement>()

/** 点击画布 */
function handleClickCanvas(event: MouseEvent) {
  const { left, top } = imgContainerRef.value!.getBoundingClientRect()
  const x = event.clientX - left
  const y = event.clientY - top

  emits('click:canvas', x, y, event)
}
</script>

<template>
  <div class="captcha-container" :style="containerStyle">
    <div ref="imgContainerRef" class="img-container" @click="handleClickCanvas">
      <slot />
    </div>

    <div v-show="loading || loadingError" class="load-container">
      <component :is="loadIcon" class="load-icon"></component>
      <div class="load-text">{{ loadText }}</div>
    </div>

    <div class="top-container">
      <div class="top-btn-list">
        <button
          v-show="refreshVisible"
          class="top-btn"
          type="button"
          title="刷新"
          :disabled="refreshDisabled"
          @click="$emit('refresh')"
        >
          <IconReload class="top-btn__icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.captcha-container,
.img-container {
  position: relative;
  overflow: hidden;
}

.load-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e8ebed;
}

.load-icon {
  font-size: 32px;
  color: #a1aab3;
}

.load-text {
  line-height: 20px;
}

.top-container {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
}

.top-btn {
  width: 30px;
  height: 30px;
  padding: 4px;
  color: #f7f7f7;
  cursor: pointer;
  background-color: rgb(0 0 0 / 12%);
  border: none;
  outline: none;

  &:disabled {
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    color: white;
    background-color: rgb(0 0 0 / 20%);
  }
}

.top-btn__icon {
  width: 100%;
  height: 100%;
}
</style>
