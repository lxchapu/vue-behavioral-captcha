<script lang="ts" setup>
import { SlideCaptcha, RotateCaptcha, PointCaptcha, SlidePuzzleCaptcha } from '@/components'
import Block from './components/Block.vue'
</script>

<template>
  <Block title="滑动拼图验证码">
    <SlidePuzzleCaptcha />
  </Block>
  <Block title="滑动拼图验证码（圆角矩形）">
    <SlidePuzzleCaptcha block-type="roundRect" />
  </Block>
  <Block title="旋转验证码">
    <RotateCaptcha />
  </Block>
  <Block title="点触式验证码">
    <PointCaptcha />
  </Block>
  <Block title="点触式验证码（语序判断）">
    <PointCaptcha type="idiom" />
  </Block>
  <Block title="滑动验证码">
    <SlideCaptcha />
  </Block>
</template>
