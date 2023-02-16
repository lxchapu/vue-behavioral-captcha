<!--
 * @Author: 杨旭
 * @Date: 2023-02-15 17:11:07
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-16 18:43:40
 * @FilePath: \vue-slide-puzzle\src\App.vue
 * @Description: 
-->
<script lang="ts" setup>
import PuzzleSlider from './components/puzzle-slider/PuzzleSlider.vue'

function handleSuccess() {
  console.log('success')
}
</script>

<template>
  <PuzzleSlider @success="handleSuccess" />
</template>
