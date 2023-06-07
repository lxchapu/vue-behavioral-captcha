/** 控制器状态 */
export type CaptchaControlState = 'ready' | 'error' | 'success'

/** 文本信息 */
export type PointTextItem = {
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  angle: number
}
/** 点触式验证码类型 */
export type PointCaptchaType = 'order' | 'idiom'

/** 滑动拼图形状 */
export type PuzzleBlockType = 'jigsaw' | 'roundRect'
