<script lang="ts" setup>
import IconReload from '../icons/Reload.vue'

defineProps({
  showRefresh: {
    type: Boolean,
    default: true,
  },
})
defineEmits(['refresh'])
</script>

<template>
  <div class="btn-list">
    <button v-if="showRefresh" class="btn" type="button" title="刷新" @click="$emit('refresh')">
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

  &:hover {
    color: white;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.btn_icon {
  width: 100%;
  height: 100%;
}
</style>
