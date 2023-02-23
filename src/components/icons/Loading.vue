<template>
  <div class="icon-loading"></div>
</template>

<style lang="scss" scoped>
.icon-loading {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 2px solid gray;
  border-top-color: transparent;
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
