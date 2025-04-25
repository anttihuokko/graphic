import { MathUtil } from './MathUtil'

describe('MathUtil', () => {
  test('should round by', () => {
    expect(MathUtil.roundBy(90, 10)).toBe(90)
    expect(MathUtil.roundBy(94, 10)).toBe(90)
    expect(MathUtil.roundBy(95, 10)).toBe(100)
    expect(MathUtil.roundBy(100, 10)).toBe(100)
    expect(MathUtil.roundBy(104, 10)).toBe(100)
    expect(MathUtil.roundBy(105, 10)).toBe(110)
  })

  test('should count decimals', () => {
    expect(MathUtil.getDecimalCount(1)).toBe(0)
    expect(MathUtil.getDecimalCount(1.1)).toBe(1)
    expect(MathUtil.getDecimalCount(0.123)).toBe(3)
  })

  test('should chunk number', () => {
    expect(MathUtil.chunk(0, 4)).toEqual([])
    expect(MathUtil.chunk(10, 40)).toEqual([10])
    expect(MathUtil.chunk(-10, 40)).toEqual([-10])
    expect(MathUtil.chunk(100, 40)).toEqual([40, 40, 20])
    expect(MathUtil.chunk(-100, 40)).toEqual([-40, -40, -20])
  })

  test('should clamp number', () => {
    expect(MathUtil.clamp(1, 1, 1)).toBe(1)
    expect(MathUtil.clamp(4, 1, 10)).toBe(4)
    expect(MathUtil.clamp(-2, 1, 10)).toBe(1)
    expect(MathUtil.clamp(20, 1, 10)).toBe(10)
  })

  test('should round number', () => {
    expect(MathUtil.round(1)).toBe(1)
    expect(MathUtil.round(1.1)).toBe(1)
    expect(MathUtil.round(1.1, 2)).toBe(1.1)
    expect(MathUtil.round(1.12345, 2)).toBe(1.12)
    expect(MathUtil.round(1.12345, 5)).toBe(1.12345)
    expect(MathUtil.round(1.12345, 10)).toBe(1.12345)
  })
})
