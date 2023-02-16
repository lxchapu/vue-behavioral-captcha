<script lang="ts" setup>
defineProps({
  text: { type: String, default: '加载中...' },
})
</script>

<template>
  <div class="loading">
    <div class="ring"></div>
    <div class="text">{{ text }}</div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e8ebed;
}
.ring {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid gray;
  border-top-color: transparent;
  animation: loading 0.8s linear infinite;
}

@keyframes loading {
  0% {
    transform: rotate(-45deg);
  }
  100% {
    transform: rotate(315deg);
  }
}

.text {
  line-height: 20px;
}
</style>
