import { shuffle, random, randomHexColor, range } from '@/utils'

export function createTextList(
  w: number,
  h: number,
  textList: string[],
  minFontSize = 26,
  maxFontSize = 36,
  safePadding = 15
) {
  const cell = maxFontSize * 1.6
  const colMaxNum = Math.floor((w - safePadding * 2) / cell)
  const rowMaxNum = Math.floor((h - safePadding * 2) / cell)

  const indexList = shuffle(range(colMaxNum * rowMaxNum), textList.length)

  function getX(colIndex: number, fontSize: number) {
    const sx = (w - colMaxNum * cell) / 2 + colIndex * cell
    const ex = sx + cell - fontSize

    return random(sx, ex)
  }
  function getY(rowIndex: number, fontSize: number) {
    const sy = (h - rowMaxNum * cell) / 2 + rowIndex * cell
    const ey = sy + cell - fontSize

    return random(sy, ey)
  }

  return indexList.map((item, index) => {
    const colIndex = item % colMaxNum
    const rowIndex = Math.floor(item / colMaxNum)
    const fontSize = random(minFontSize, maxFontSize)

    return {
      x: getX(colIndex, fontSize),
      y: getY(rowIndex, fontSize),
      text: textList[index],
      fontSize,
      color: randomHexColor(),
      angle: random(-90, 90),
    }
  })
}
