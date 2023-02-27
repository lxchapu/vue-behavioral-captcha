<script lang="ts" setup>
import { IconImageError, IconLoading } from './icons'

import type { PropType } from 'vue'

import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  state: { type: String as PropType<'error' | 'loading'>, default: 'loading' },
})

const icon = computed(() => {
  if (props.state === 'loading') return IconLoading
  return IconImageError
})
</script>

<template>
  <div class="load-container">
    <component class="icon" :is="icon"></component>
    <div class="text">{{ text }}</div>
  </div>
</template>

<style lang="scss" scoped>
.load-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #e8ebed;
}

.icon {
  font-size: 32px;
  color: #a1aab3;
}

.text {
  line-height: 20px;
}
</style>
