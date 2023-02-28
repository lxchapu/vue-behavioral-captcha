<script lang="ts" setup>
import { IconReload } from './icons'

import type { PropType } from 'vue'

defineProps({
  data: {
    type: Array as PropType<
      { event: () => void; title: string; visible: boolean; disabled: boolean }[]
    >,
    required: true,
  },
})

defineEmits(['refresh'])
</script>

<template>
  <div class="btn-list">
    <button
      v-for="(item, index) in data"
      v-show="item.visible"
      :key="index"
      class="btn"
      type="button"
      :title="item.title"
      :disabled="item.disabled"
      @click="item.event"
    >
      <IconReload class="btn__icon" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.btn {
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

.btn__icon {
  width: 100%;
  height: 100%;
}
</style>
