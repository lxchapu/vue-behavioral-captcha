<script lang="ts" setup>
import { PuzzleSlider } from './components'

function handleSuccess() {
  console.log('success')
}
</script>

<template>
  <PuzzleSlider @success="handleSuccess" />
</template>
