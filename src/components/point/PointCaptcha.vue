<script lang="ts" setup>
import CaptchaPanel from './CaptchaPanel.vue'
import CaptchaControl from './CaptchaControl.vue'

import type { PropType } from 'vue'
import type { ControlState, PointCaptchaType, TextItem } from './types'

import { onMounted, ref, computed, nextTick } from 'vue'
import { createTextList, getRandomIdiom, getRandomText } from './useCreateCaptcha'
import { random } from '../slide-puzzle/utils'

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

const emits = defineEmits(['success', 'error'])

let errorTimes = 0

const bgImg = ref('')
const textList = ref<TextItem[]>([])

const loading = ref(false)
const panelDisabled = ref(false)
const imgError = ref('')
const answer = ref<string[]>([])
const panelRef = ref()
const maxError = ref(false)
const controlState = ref<ControlState>('ready')

const tipText = computed(() => {
  if (loading.value) return props.loadingText
  if (imgError.value) return imgError.value
  if (maxError.value) return props.maxErrorText
  if (controlState.value === 'error') return '验证失败请重试'
  if (controlState.value === 'success') return '验证成功'
  if (props.type === 'idiom') return '请按语序依次点击文字'
  return '请依次点击'
})

const controlClickabled = computed(() => maxError.value || imgError.value !== '')

const refreshBtnVisible = computed(() => controlState.value !== 'success')
const controlAnswer = computed(() => {
  if (
    props.type === 'order' &&
    controlState.value === 'ready' &&
    !loading.value &&
    !imgError.value
  ) {
    return answer.value
  }
  return []
})

/** 初始化验证码 */
function initCaptcha() {
  const { imgList, width, height, type } = props

  /* reset */
  answer.value = []
  panelDisabled.value = false
  maxError.value = false

  let list = []
  if (type === 'order') {
    list = getRandomText(5)
    answer.value = list.slice(0, 3)
  } else {
    const idiom = getRandomIdiom()
    list = idiom.split('')
  }

  textList.value = createTextList(width, height, list)
  bgImg.value = imgList[random(0, imgList.length)]
  /* 绘制验证码 */
  nextTick(async () => {
    try {
      loading.value = true
      imgError.value = ''
      await panelRef.value.drawCaptcha()
      controlState.value = 'ready'
    } catch (error: any) {
      imgError.value = error
      controlState.value = 'error'
    } finally {
      loading.value = false
    }
  })
}

/** 校验验证码是否通过 */
function finish(pointList: { x: number; y: number }[]) {
  const max = props.type === 'idiom' ? 4 : 3
  if (pointList.length < max) return

  panelDisabled.value = true

  let success = true
  pointList.forEach((item, index) => {
    const { text, inRange } = getClosestText(item.x, item.y)

    if (!inRange || textList.value[index].text !== text) success = false
  })

  if (success) {
    controlState.value = 'success'
    errorTimes = 0
    emits('success')
  } else {
    errorTimes += 1
    controlState.value = 'error'
    emits('error')
    if (errorTimes < 5) {
      initCaptcha()
    } else {
      maxError.value = true
    }
  }
}

function getClosestText(x: number, y: number) {
  let text = '',
    inRange = false,
    minD = -1

  textList.value.forEach((item) => {
    const d = getDistance(item.x + item.fontSize / 2, item.y + item.fontSize / 2, x, y)
    if (minD < 0 || d < minD) {
      minD = d
      text = item.text
      inRange = d <= item.fontSize / 2
    }
  })

  return {
    text,
    inRange,
  }
}
/** 计算两点距离 */
function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

/** 刷新验证码 */
function refresh() {
  initCaptcha()
}

onMounted(() => {
  initCaptcha()
})
</script>

<template>
  <div
    class="point-captcha"
    :style="{
      width: `${width}px`,
    }"
  >
    <CaptchaPanel
      ref="panelRef"
      :width="width"
      :height="height"
      :border-radius="borderRadius"
      :text-list="textList"
      :bg-img="bgImg"
      :disabled="panelDisabled"
      :loading-text="loadingText"
      :refresh-btn-visible="refreshBtnVisible"
      @point="finish"
      @refresh="refresh"
    />
    <CaptchaControl
      :width="width"
      :height="40"
      :border-radius="borderRadius"
      :tip-text="tipText"
      :answer="controlAnswer"
      :state="controlState"
      :clickabled="controlClickabled"
      @refresh="refresh"
    />
  </div>
</template>

<style lang="scss" scoped>
.captcha-panel {
  margin-bottom: 15px;
}
</style>
