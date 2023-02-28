<script lang="ts" setup>
import { IconCheck, IconClose } from '../icons'

import type { PropType } from 'vue'
import type { ControlState } from '@/types'

import { computed } from 'vue'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  borderRadius: { type: Number, required: true },
  tipText: { type: String, required: true },
  answer: { type: Array as PropType<string[]>, required: true },
  state: { type: String as PropType<ControlState>, required: true },
  clickabled: { type: Boolean, required: true },
})
const emits = defineEmits(['refresh'])

const tipIcon = computed(() => {
  if (props.state === 'error') return IconClose
  if (props.state === 'success') return IconCheck
  return null
})

const answerText = computed(() => {
  return props.answer.map((item) => `"${item}"`).join(' ')
})
/** 点击提示 */
function handleClickTip() {
  if (props.clickabled) {
    emits('refresh')
  }
}
</script>

<template>
  <div
    class="captcha-control"
    :class="`captcha-control--${state}`"
    :style="{
      height: `${height}px`,
      borderRadius: `${borderRadius}px`,
    }"
  >
    <div class="tip" :class="{ 'tip--clickabled': clickabled }" @click="handleClickTip">
      <component v-if="tipIcon" class="tip__icon" :is="tipIcon" />
      <div class="tip__text">
        {{ tipText }}
        <span v-if="answer.length" class="tip__anawer-text">{{ answerText }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.captcha-control {
  box-sizing: border-box;
  color: #45494c;
  background-color: #f7f9fa;
  border: 1px solid #e4e7eb;
}

.captcha-control--error {
  color: #f57a7a;
  background-color: #fce1e1;
  border-color: #f57a7a;
}

.captcha-control--success {
  color: #52ccba;
  background-color: #d2f4ef;
  border-color: #52ccba;
}

.tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.tip--clickabled {
  cursor: pointer;
}

.tip__icon {
  display: inline-block;
  margin-right: 5px;
  vertical-align: -0.15em;
}

.tip__text {
  line-height: 18px;
  user-select: none;
}

.tip__anawer-text {
  font-weight: bold;
}
</style>
