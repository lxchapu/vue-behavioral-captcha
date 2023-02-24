import type { Ref } from 'vue'

import { computed } from 'vue'

export function usePuzzleSize(type: Ref<'jigsaw' | 'suqare'>, size: Ref<number>, padding: number) {
  /** 偏移角弧度 */
  const offsetAngle = 0.7
  /** 凸起半径 */
  const bulgeR = computed(() => size.value / 5)
  /** 圆心偏移量 */
  const bulgeOffset = computed(() => Math.cos(offsetAngle) * bulgeR.value)
  /** 平涂凸起的长度 */
  const bulgeSize = computed(() => bulgeR.value + bulgeOffset.value)

  /** 拼图块大小 */
  const blockBaseSize = computed(() => {
    if (type.value === 'jigsaw') {
      return size.value + bulgeSize.value
    } else {
      return size.value
    }
  })
  /** 拼图块大小加上左右边距 */
  const blockRealWidth = computed(() => blockBaseSize.value + padding * 2)

  return {
    bulgeOffset,
    offsetAngle,
    blockBaseSize,
    blockRealWidth,
    bulgeR,
    bulgeSize,
  }
}
