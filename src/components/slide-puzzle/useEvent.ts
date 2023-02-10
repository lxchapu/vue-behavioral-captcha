/*
 * @Author: 杨旭
 * @Date: 2023-02-09 11:02:24
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-09 11:03:44
 * @FilePath: \superset-chart\src\components\table\useEvent.ts
 * @Description:
 */
import { onBeforeUnmount, onMounted } from 'vue'
/**
 * 添加窗口事件
 * @param {string} event
 * @param {function} eventCallback
 */
export function useEvent(event: string, eventCallback: (event: any) => void) {
  onMounted(() => {
    window.addEventListener(event, eventCallback)
  })
  onBeforeUnmount(() => {
    window.removeEventListener(event, eventCallback)
  })
}
