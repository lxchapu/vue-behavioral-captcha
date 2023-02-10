<!--
 * @Author: 杨旭
 * @Date: 2023-02-09 17:04:51
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-09 17:28:29
 * @FilePath: \vue-slide-puzzle\src\components\slide-puzzle\SlidePuzzle.vue
 * @Description: 
-->
<script lang="ts" setup>
import Panel from './Panel.vue'
import Control from './Control.vue'

const width = 320,
  height = 160
</script>

<template>
  <div
    class="puzzle"
    :style="{
      width: `${width}px`,
    }"
  >
    <Panel class="puzzle-panel" :width="width" :height="height" />
    <Control class="puzzle-control" />
  </div>
</template>

<style lang="scss" scoped>
.puzzle {
  position: relative;
  font-size: 14px;
  margin: auto;
}
.puzzle-panel {
  margin-bottom: 15px;
}
</style>

<style lang="scss">
.puzzle {
  * {
    box-sizing: border-box;
  }
}
</style>
