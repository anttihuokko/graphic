import { MathUtil } from './MathUtil'

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
