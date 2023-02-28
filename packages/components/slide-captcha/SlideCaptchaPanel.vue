<!--
 * @Author: 杨旭
 * @Date: 2023-02-27 14:58:35
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-28 17:23:14
 * @FilePath: \vue-behavioral-captcha\packages\components\slide-captcha\SlideCaptchaPanel.vue
 * @Description: 滑动拼图验证码显示组件
-->
<script lang="ts" setup>
import LoadContainer from '../LoadContainer.vue'
import BtnList from '../BtnList.vue'

import type { PropType } from 'vue'
import type { BlockType } from '@/types'

import { computed, reactive, toRef } from 'vue'
import { loadImg } from '@/utils'
import { useSlideCaptchaRender } from './useSlideCaptchRender'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  borderRadius: { type: Number, required: true },
  safePadding: { type: Number, required: true },
  blockSize: { type: Number, required: true },
  blockType: { type: String as PropType<BlockType>, required: true },
  blockPadding: { type: Number, default: 2 },
  blockRadius: { type: Number, default: 5 },
  loadingText: { type: String, required: true },
  done: { type: Boolean, required: true },
  img: { type: String, required: true },
  blockLeft: { type: Number, required: true },
})

const emits = defineEmits(['refresh'])

const { fullCanvasRef, bgCanvasRef, blockCanvasRef, blockRealWidth, render, clearCanvas } =
  useSlideCaptchaRender(
    toRef(props, 'width'),
    toRef(props, 'height'),
    toRef(props, 'blockType'),
    toRef(props, 'blockSize'),
    toRef(props, 'blockPadding'),
    toRef(props, 'blockRadius')
  )

/** 状态 */
const state = reactive({
  loadError: '',
  loading: false,
})

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

/** 点击刷新 */
function handleRefresh() {
  emits('refresh')
}
/** 绘制验证码 */
async function drawCaptcha(x: number, y: number) {
  /* 重置状态 */
  state.loadError = ''
  state.loading = true

  try {
    clearCanvas()
    const img = await loadImg(props.img)
    render(img, x, y)
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
