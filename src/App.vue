<script lang="ts" setup>
import { PointCaptcha, SlideCaptcha, RotateCaptcha } from './components'
</script>

<template>
  <PointCaptcha />
  <PointCaptcha type="idiom" />
  <SlideCaptcha />
  <SlideCaptcha block-type="suqare" />
  <RotateCaptcha />
</template>
