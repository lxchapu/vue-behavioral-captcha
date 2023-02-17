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
