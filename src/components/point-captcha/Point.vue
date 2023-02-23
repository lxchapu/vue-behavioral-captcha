<script lang="ts" setup>
defineProps({
  value: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="point">
    <span class="point__text">{{ value }}</span>
  </div>
</template>

<style lang="scss" scoped>
.point {
  position: relative;
  width: 26px;
  line-height: 32px;
  height: 32px;

  &::before {
    position: absolute;
    left: 50%;
    top: 100%;
    content: '';
    box-sizing: border-box;
    width: 26px;
    height: 26px;

    border-radius: 50%;
    border-top-left-radius: 2px;
    border: 2px solid #fff;

    background-color: rgba(#1a7ace, 0.8);

    transform-origin: left top;
    transform: rotate(225deg);
  }
}

.point__text {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  font-size: 14px;
  text-align: center;
  user-select: none;
  color: #fff;
}
</style>
