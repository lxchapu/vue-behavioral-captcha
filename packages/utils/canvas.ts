import type { PointTextItem } from '../types'

/** 绘制文字 */
export function drawText(ctx: CanvasRenderingContext2D, text: PointTextItem) {
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

/** 绘制圆形的图片 */
export function drawRoundedImg(
  ctx: CanvasRenderingContext2D,
  options: {
    x: number
    y: number
    r: number
    rangle: number
    img: HTMLImageElement
  }
) {
  const { x, y, r, rangle, img } = options
  const imgMin = Math.min(img.width, img.height)

  ctx.arc(x + r, y + r, r, 0, Math.PI * 2)
  ctx.clip()

  ctx.save()
  ctx.translate(x + r, y + r)
  ctx.rotate((Math.PI / 180) * rangle)
  ctx.drawImage(img, 0, 0, imgMin, imgMin, -r, -r, r * 2, r * 2)
  ctx.restore()
}

/** 绘制拼图形状 */
function drawJigsawPath(
  ctx: CanvasRenderingContext2D,
  options: {
    x: number
    y: number
    width: number
    height: number
    bulgeR: number
    /** 拼图凸起圆心的偏移量 */
    bulgeOffset: number
  }
) {
  const { x, y, width, height, bulgeR, bulgeOffset } = options
  const PI = Math.PI
  /** 凸起的长度 */
  const bulgeH = bulgeR + bulgeOffset
  const offsetAngle = Math.acos(bulgeOffset / bulgeR)

  ctx.beginPath()
  ctx.moveTo(x, y + bulgeH)
  /* top */
  ctx.arc(x + width / 2, y + bulgeR, bulgeR, 0.5 * PI + offsetAngle, 0.5 * PI - offsetAngle)
  ctx.lineTo(x + width, y + bulgeH)
  /* right */
  ctx.arc(
    x + width + bulgeOffset,
    y + bulgeH + height / 2,
    bulgeR,
    PI + offsetAngle,
    PI - offsetAngle
  )
  ctx.lineTo(x + width, y + bulgeH + height)
  /* bottom */
  ctx.arc(
    x + width / 2,
    y + height + bulgeR,
    bulgeR,
    0.5 * PI - offsetAngle,
    0.5 * PI + offsetAngle,
    true
  )
  ctx.lineTo(x, y + height + bulgeH)
  /* left */
  ctx.lineTo(x, y + bulgeH)
}
/** 绘制圆角矩形 */
function drawRoundRectPath(
  ctx: CanvasRenderingContext2D,
  options: { x: number; y: number; width: number; height: number; radius: number }
) {
  const { x, y, width, height, radius } = options
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
}
/** 绘制拼图块轮廓 */
function drawBlockPath(
  ctx: CanvasRenderingContext2D,
  options: {
    type: 'jigsaw' | 'roundRect'
    x: number
    y: number
    width: number
    height: number
    bulgeR: number
    bulgeOffset: number
    radius: number
  }
) {
  const { type } = options
  if (type === 'jigsaw') drawJigsawPath(ctx, options)
  else drawRoundRectPath(ctx, options)
}

/** 绘制缺少的拼图块 */
export function drawMissingBlock(
  ctx: CanvasRenderingContext2D,
  options: {
    type: 'jigsaw' | 'roundRect'
    x: number
    y: number
    width: number
    height: number
    bulgeR: number
    bulgeOffset: number
    radius: number
  }
) {
  const { x, y, width, height } = options
  /* 内部填充白色 */
  ctx.save()
  drawBlockPath(ctx, options)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.restore()
  /* 绘制内阴影 */
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  drawBlockPath(ctx, options)
  ctx.arc(x + Math.ceil(width / 2), y + Math.ceil(height / 2), width * 1.2, 0, Math.PI * 2, true)
  ctx.shadowColor = '#000'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowBlur = 16
  ctx.fill()
  ctx.restore()
}

/** 绘制拼图块 */
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  options: {
    type: 'jigsaw' | 'roundRect'
    x: number
    y: number
    width: number
    height: number
    bulgeR: number
    bulgeOffset: number
    radius: number
    img: HTMLImageElement
    canvasWidth: number
    canvasHeight: number
    safePadding: number
  }
) {
  const { x, y, width, height, img, canvasHeight, canvasWidth, safePadding } = options
  ctx.save()
  /* 绘制剪切区域和外阴影 */
  drawBlockPath(ctx, { ...options, x: safePadding })
  ctx.closePath()
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.shadowColor = '#000'
  ctx.shadowBlur = 3
  ctx.fill()
  ctx.clip()
  /* 绘制剪切图片 */
  ctx.drawImage(img, x - safePadding, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight)
  /* 绘制内阴影 */
  ctx.globalCompositeOperation = 'source-atop'
  drawBlockPath(ctx, { ...options, x: safePadding })
  ctx.arc(
    safePadding + Math.ceil(width / 2),
    y + Math.ceil(height / 2),
    width * 1.2,
    0,
    Math.PI * 2,
    true
  )
  ctx.closePath()
  /* 内阴影 */
  ctx.shadowColor = 'rgba(255, 255, 255, .8)'
  ctx.shadowOffsetX = -1
  ctx.shadowOffsetY = -1
  ctx.shadowBlur = 12
  ctx.fillStyle = '#ffffaa'
  ctx.fill()
  ctx.restore()
}
