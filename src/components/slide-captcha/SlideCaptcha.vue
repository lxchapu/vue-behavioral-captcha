<script lang="ts" setup>
import SlideCaptchaPanel from './SlideCaptchaPanel.vue'
import CaptchaControl from './CaptchaControl.vue'

import type { PropType } from 'vue'
import type { ControlState } from './types'

import { ref, computed, onMounted, nextTick, toRef } from 'vue'
import { random } from '@/utils'
import { usePuzzleSize } from './usePuzzleSize'

const props = defineProps({
  /** 画布宽度 */
  width: { type: Number, default: 320 },
  height: { type: Number, default: 160 },
  borderRadius: { type: Number, default: 2 },
  blockSize: { type: Number, default: 40 },
  blockType: { type: String as PropType<'jigsaw' | 'suqare'>, default: 'jigsaw' },
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

let answer = 0
let errorTimes = 0

const loading = ref(false)
const imgError = ref('')
const maxError = ref(false)

const captchaImg = ref('')
const panelRef = ref()
const safePadding = 4
const blockPadding = 2
const blockLeft = ref(0)

const sliderMax = computed(() => props.width - blockRealWidth.value)
const controlState = ref<ControlState>('ready')
const sliderTipText = computed(() => {
  if (loading.value) return props.loadingText
  if (imgError.value) return imgError.value
  if (maxError.value) return props.maxErrorText
  return props.tipText
})

const { blockBaseSize, blockRealWidth } = usePuzzleSize(
  toRef(props, 'blockType'),
  toRef(props, 'blockSize'),
  blockPadding
)

/** 获取随机图片地址 */
function getRandomImgUrl() {
  const { imgList } = props
  const index = random(0, imgList.length)
  return imgList[index]
}

/** 初始化拼图 */
function initCaptcha() {
  blockLeft.value = 0
  maxError.value = false

  captchaImg.value = getRandomImgUrl()
  /** 生成坐标 */
  const randomX = random(
    blockRealWidth.value + safePadding,
    props.width - safePadding - blockBaseSize.value
  )
  const randomY = random(safePadding, props.height - safePadding - blockBaseSize.value)

  answer = randomX - blockPadding

  nextTick(async () => {
    try {
      loading.value = true
      imgError.value = ''
      await panelRef.value.drawCaptcha(randomX, randomY)
      controlState.value = 'ready'
    } catch (error: any) {
      imgError.value = error
      controlState.value = 'error'
    } finally {
      loading.value = false
    }
  })
}

/** 刷新验证码 */
async function refresh() {
  initCaptcha()
}

/** 校验验证码是否通过 */
async function finish() {
  if (Math.abs(answer - blockLeft.value) < props.range) {
    controlState.value = 'success'
    emits('success')
    errorTimes = 0
  } else {
    emits('fail')
    errorTimes += 1
    if (errorTimes >= 5) {
      maxError.value = true
      errorTimes = 0
    } else {
      controlState.value = 'error'
      initCaptcha()
    }
  }
}

onMounted(() => {
  initCaptcha()
})
</script>

<template>
  <div
    class="slide-captcha"
    :style="{
      width: `${width}px`,
    }"
  >
    <SlideCaptchaPanel
      ref="panelRef"
      :width="width"
      :height="height"
      :border-radius="borderRadius"
      :safe-padding="safePadding"
      :block-size="blockSize"
      :block-type="blockType"
      :block-padding="blockPadding"
      :loading-text="loadingText"
      :done="controlState === 'success'"
      :block-left="blockLeft"
      :img="captchaImg"
      @refresh="refresh"
    />
    <CaptchaControl
      v-model="blockLeft"
      :width="width"
      :height="sliderSize"
      :border-radius="borderRadius"
      :max="sliderMax"
      :state="controlState"
      :tip-text="sliderTipText"
      :max-error="maxError"
      :disable="loading"
      @finish="finish"
      @refresh="refresh"
    />
  </div>
</template>

<style lang="scss" scoped>
.slide-captcha {
  font-size: 14px;
}
.captcha-panel {
  margin-bottom: 15px;
}
</style>
