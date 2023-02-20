<script lang="ts" setup>
import { IconReload } from '../icons'

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
      <IconReload class="btn_icon" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.btn {
  width: 30px;
  height: 30px;
  padding: 4px;
  border: none;
  outline: none;
  color: #f7f7f7;
  background-color: rgba(0, 0, 0, 0.12);
  cursor: pointer;

  &:not(:disabled):hover {
    color: white;
    background-color: rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.btn_icon {
  width: 100%;
  height: 100%;
}
</style>
