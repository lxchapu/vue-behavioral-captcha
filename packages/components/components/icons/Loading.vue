<!--
 * @Author: 杨旭
 * @Date: 2023-02-24 11:28:26
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-24 17:06:56
 * @FilePath: \zyx-components\packages\components\captcha\components\icons\Loading.vue
 * @Description: 图标 加载
-->
<template>
  <div class="z-icon-loading"></div>
</template>

<style lang="scss" scoped>
.z-icon-loading {
  width: 1em;
  height: 1em;
  border: 2px solid gray;
  border-top-color: transparent;
  border-radius: 50%;
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
</style>
