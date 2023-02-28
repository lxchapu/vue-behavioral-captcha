/*
 * @Author: 杨旭
 * @Date: 2023-02-24 17:15:10
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-28 16:37:31
 * @FilePath: \vue-behavioral-captcha\packages\types\index.d.ts
 * @Description: 验证码组件类型声明
 */
/** 验证码控制器状态 */
export type ControlState = 'ready' | 'error' | 'success'
/** 文本信息 */
export type TextItem = {
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  angle: number
}
/** 点选式验证码类型 */
export type PointCaptchaType = 'order' | 'idiom'
/** 拼图类型 */
export type BlockType = 'jigsaw' | 'roundRect'
