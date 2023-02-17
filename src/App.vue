<!--
 * @Author: 杨旭
 * @Date: 2023-02-15 17:11:07
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-17 10:47:39
 * @FilePath: \vue-slide-puzzle\src\App.vue
 * @Description: 
-->
<script lang="ts" setup>
import { PuzzleSlider } from './components'

function handleSuccess() {
  console.log('success')
}
</script>

<template>
  <PuzzleSlider @success="handleSuccess" />
</template>
