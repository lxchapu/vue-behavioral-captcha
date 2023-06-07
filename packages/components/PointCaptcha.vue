<!--
 * @Author: 杨旭
 * @Date: 2023-03-01 14:05:23
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-06-07 09:30:09
 * @FilePath: \vue-behavioral-captcha\packages\components\PointCaptcha.vue
 * @Description: 点触式验证码
-->
<script lang="ts" setup>
import PointControl from './components/PointControl.vue'
import Point from './components/Point.vue'
import CaptchaContainer from './components/CaptchaContainer.vue'

import type { PropType } from 'vue'
import type { PointCaptchaType, CaptchaControlState } from '../types'

import { onMounted, ref, computed, nextTick, toRef } from 'vue'
import { usePointCaptcha } from '../hooks'

const props = defineProps({
  width: { type: Number, default: 320 },
  height: { type: Number, default: 160 },
  borderRadius: { type: Number, default: 2 },
  type: { type: String as PropType<PointCaptchaType>, default: 'order' },
  maxErrorText: { type: String, default: '失败过多，点击重试' },
  loadingText: { type: String, default: '加载中…' },
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
})

const emits = defineEmits(['success', 'fail'])

const { imgCanvasRef, pointList, textList, state, initCaptcha, validateCaptcha } = usePointCaptcha(
  toRef(props, 'width'),
  toRef(props, 'height'),
  toRef(props, 'type'),
  toRef(props, 'imgList')
)

let errorTimes = 0

const maxError = ref(false)
const controlState = ref<CaptchaControlState>('ready')

const tipText = computed(() => {
  if (state.loading) return props.loadingText
  if (state.loadingError) return state.loadingError
  if (maxError.value) return props.maxErrorText
  if (controlState.value === 'error') return '验证失败请重试'
  if (controlState.value === 'success') return '验证成功'
  if (props.type === 'idiom') return '请按语序依次点击文字'
  return '请依次点击'
})

const maxPointNum = computed(() => (props.type === 'idiom' ? 4 : 3))

const pointDisabled = computed(() => {
  return pointList.value.length >= maxPointNum.value || state.loading || state.loadingError !== ''
})

const controlClickabled = computed(() => maxError.value || state.loadingError !== '')

const refreshVisible = computed(() => controlState.value !== 'success')

const refreshDisabled = computed(() => state.loading)

const controlAnswer = computed(() => {
  if (
    props.type === 'order' &&
    controlState.value === 'ready' &&
    !state.loading &&
    !state.loadingError
  ) {
    return textList.value.map((item) => item.text).slice(0, 3)
  }
  return []
})

/** 校验验证码是否通过 */
function checkCaptcha() {
  const pass = validateCaptcha()
  if (pass) {
    controlState.value = 'success'
    errorTimes = 0
    emits('success')
  } else {
    controlState.value = 'error'
    errorTimes += 1
    emits('fail')
    if (errorTimes < 5) {
      refreshCaptcha()
    } else {
      maxError.value = true
    }
  }
}

/** 刷新验证码 */
async function refreshCaptcha() {
  /* reset */
  maxError.value = false
  try {
    await initCaptcha()
    controlState.value = 'ready'
  } catch {
    controlState.value = 'error'
  }
}

onMounted(() => {
  refreshCaptcha()
})

/** 点击画布 */
function handleClickCanvas(x: number, y: number) {
  if (pointDisabled.value) return

  pointList.value.push({
    x,
    y,
  })

  if (pointList.value.length >= maxPointNum.value) {
    nextTick(checkCaptcha)
  }
}
/** 撤销点击 */
function handleClickPoint(index: number, event: MouseEvent) {
  if (pointDisabled.value) return

  if (index === pointList.value.length - 1) {
    pointList.value.pop()
    event.stopPropagation()
  }
}
</script>

<template>
  <div
    class="z-point-captcha"
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
      @click:canvas="handleClickCanvas"
      @refresh="refreshCaptcha"
    >
      <canvas ref="imgCanvasRef" class="canvas-img" :width="width" :height="height"></canvas>

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
    </CaptchaContainer>

    <PointControl
      :width="width"
      :height="40"
      :border-radius="borderRadius"
      :tip-text="tipText"
      :answer="controlAnswer"
      :state="controlState"
      :clickabled="controlClickabled"
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

.point {
  position: absolute;
  cursor: pointer;
  transform: translate(-50%, -100%);
}
</style>
