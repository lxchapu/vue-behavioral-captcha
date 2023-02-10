<!--
 * @Author: 杨旭
 * @Date: 2023-02-09 16:39:35
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-10 18:13:51
 * @FilePath: \vue-slide-puzzle\src\components\slide-puzzle\Panel.vue
 * @Description: 
-->
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import imgPath from '@/assets/images/test.webp'

const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
})

const bgCanvasRef = ref<HTMLCanvasElement>()
const jigsawCanvasRef = ref<HTMLCanvasElement>()

let bgCtx: CanvasRenderingContext2D | null = null,
  jigsawCtx: CanvasRenderingContext2D | null = null

function init() {
  bgCtx = bgCanvasRef.value!.getContext('2d')
  jigsawCtx = jigsawCanvasRef.value!.getContext('2d')
  const img = new Image()
  img.src = imgPath
  img.onload = () => {
    const { width, height } = props

    /* 保存画布状态 */
    bgCtx?.save()

    drawJigsaw(bgCtx!, {
      x: 100,
      y: 100,
      size: 40,
    })
    bgCtx!.clip()

    drawJigsaw(bgCtx!, {
      x: 100,
      y: 100,
      size: 40,
    })

    bgCtx!.lineWidth = 1
    bgCtx!.strokeStyle = 'rgba(0,0,0,1)'
    bgCtx!.fillStyle = 'rgba(0,0,0,0.6)'
    bgCtx!.fill()
    bgCtx!.stroke()

    /* 恢复画布状态 */
    bgCtx?.restore()

    bgCtx!.globalCompositeOperation = 'destination-over'

    /* 绘制背景 */
    bgCtx?.drawImage(img, 0, 0, width, height, 0, 0, width, height)

    /* 保存画布状态 */
    jigsawCtx?.save()

    drawJigsaw(jigsawCtx!, {
      x: 100,
      y: 100,
      size: 40,
    })
    jigsawCtx!.lineWidth = 2
    jigsawCtx!.strokeStyle = 'rgba(255,255,255,1)'
    jigsawCtx!.stroke()
    jigsawCtx!.clip()

    /* 绘制背景 */
    jigsawCtx?.drawImage(img, 0, 0, width, height, 0, 0, width, height)
  }
}
/** 绘制拼图 */
function drawJigsaw(
  ctx: CanvasRenderingContext2D,
  option: {
    x: number
    y: number
    size: number
  }
) {
  const { x, y, size } = option
  const PI = Math.PI
  /* 半径 */
  const r = size / 5
  /* 偏移角弧度 */
  const offsetAngle = 0.7
  /* 圆心偏移量 */
  const offset = Math.cos(offsetAngle) * r

  ctx.beginPath()
  ctx.moveTo(x, y)
  /* top */
  ctx.arc(x + size / 2, y - offset, r, 0.5 * PI + offsetAngle, 0.5 * PI - offsetAngle)
  ctx.lineTo(x + size, y)
  /* right */
  ctx.arc(x + size + offset, y + size / 2, r, PI + offsetAngle, PI - offsetAngle)
  ctx.lineTo(x + size, y + size)
  /* bottom */
  ctx.arc(x + size / 2, y + size - offset, r, 0.5 * PI - offsetAngle, 0.5 * PI + offsetAngle, true)
  ctx.lineTo(x, y + size)
  /* left */
  ctx.closePath()
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="panel">
    <canvas ref="bgCanvasRef" class="bg-img" :width="width" :height="height"></canvas>
    <canvas
      ref="jigsawCanvasRef"
      class="jigsaw"
      :width="width"
      :height="height"
      :style="{ left: '-100px' }"
    ></canvas>
  </div>
</template>

<style lang="scss" scoped>
.panel {
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  background-color: #f7f9fa;
}

.bg-img {
  vertical-align: top;
}

.jigsaw {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: auto;
}
</style>
