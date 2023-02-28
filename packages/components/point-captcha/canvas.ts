/*
 * @Author: 杨旭
 * @Date: 2023-02-28 17:42:43
 * @LastEditors: 杨旭
 * @LastEditTime: 2023-02-28 17:42:52
 * @FilePath: \vue-behavioral-captcha\packages\components\point-captcha\canvas.ts
 * @Description: canvas 绘制函数
 */
import type { TextItem } from '@/types'

/** 绘制文字 */
export function drawText(ctx: CanvasRenderingContext2D, text: TextItem) {
  ctx.save()

  const r = text.fontSize / 2
  ctx.translate(text.x + r, text.y + r)
  ctx.rotate((Math.PI / 180) * text.angle)
  ctx.fillStyle = text.color
  ctx.textAlign = 'start'
  ctx.textBaseline = 'top'
  ctx.font = `bold ${text.fontSize}px sans-serif`
  ctx.fillText(text.text, -r, -r)

  ctx.restore()
}
