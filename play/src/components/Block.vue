<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <div>
      <slot />
    </div>
  </div>
</template>
