<!--
 * @Author: 杨旭
 * @Date: 2023-02-24 11:28:26
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-24 17:43:27
 * @FilePath: \zyx-components\packages\components\captcha\components\point-captcha\Point.vue
 * @Description: 标记点
-->
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
  height: 32px;
  line-height: 32px;

  &::before {
    position: absolute;
    top: 100%;
    left: 50%;
    box-sizing: border-box;
    width: 26px;
    height: 26px;
    content: '';
    background-color: rgba(#1a7ace, 0.8);
    border: 2px solid #fff;
    border-radius: 50%;
    border-top-left-radius: 2px;
    transform: rotate(225deg);
    transform-origin: left top;
  }
}

.point__text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 14px;
  color: #fff;
  text-align: center;
  user-select: none;
}
</style>
