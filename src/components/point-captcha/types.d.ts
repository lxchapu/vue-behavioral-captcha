export type TextItem = {
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  angle: number
}

export type PointCaptchaType = 'order' | 'idiom'
/** 验证码控制器状态 */
export type ControlState = 'ready' | 'error' | 'success'
