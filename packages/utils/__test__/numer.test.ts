import { random, clamp } from '../math'
import { describe, expect, it } from 'vitest'

describe('random()', () => {
  it('只返回 0', () => {
    expect(random(0, 1)).toBe(0)
  })

  it('整数', () => {
    const num = random(0, 12)
    expect(num).toBeGreaterThanOrEqual(0)
    expect(num).toBeLessThan(12)
  })

  it('浮点数', () => {
    const num = random(0, 12, true)
    expect(num).toBeGreaterThanOrEqual(0)
    expect(num).toBeLessThan(12)
  })
})

describe('clamp()', () => {
  it('越界', () => {
    expect(clamp(10, 1, 2)).toBe(2)
    expect(clamp(-3, 0.1, 20)).toBe(0.1)
  })

  it('边界', () => {
    expect(clamp(1, 1, 2)).toBe(1)
    expect(clamp(2.2, 1, 2.2)).toBe(2.2)
  })

  it('内部', () => {
    expect(clamp(0, -1, 2)).toBe(0)
  })
})
