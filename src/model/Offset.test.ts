import { Offset } from './Offset'

describe('Offset', () => {
  test('should check if Offset is zero', () => {
    expect(Offset.ZERO.isZero()).toBe(true)
    expect(new Offset(0, 0).isZero()).toBe(true)
    expect(new Offset(1, 0).isZero()).toBe(false)
    expect(new Offset(0, 1).isZero()).toBe(false)
    expect(new Offset(1, 1).isZero()).toBe(false)
  })

  test('should check isSmallerThan other Offset', () => {
    expect(new Offset(0, 1).isSmallerThan(new Offset(0, 1))).toBe(false)
    expect(new Offset(0, 2).isSmallerThan(new Offset(0, 1))).toBe(false)
    expect(new Offset(0, 1).isSmallerThan(new Offset(0, 2))).toBe(true)
    expect(new Offset(1, 1).isSmallerThan(new Offset(1, 2))).toBe(true)
    expect(new Offset(1, 2).isSmallerThan(new Offset(1, 1))).toBe(false)
  })

  test('should change Offset to absolute', () => {
    expect(new Offset(0, 1).abs()).toEqual(new Offset(0, 1))
    expect(new Offset(0, -1).abs()).toEqual(new Offset(0, 1))
    expect(new Offset(-1, -2).abs()).toEqual(new Offset(1, 2))
  })

  test('should multiply Offset', () => {
    expect(new Offset(0, 0).multiply(2)).toEqual(Offset.ZERO)
    expect(new Offset(2, 2).multiply(3)).toEqual(new Offset(6, 6))
    expect(new Offset(-5, -5).multiply(2)).toEqual(new Offset(-10, -10))
  })

  test('should round Offset', () => {
    expect(new Offset(0.1, 0.1).round()).toEqual(Offset.ZERO)
    expect(new Offset(5, 5.5).round()).toEqual(new Offset(5, 6))
    expect(new Offset(8.123, 8.567).round(1)).toEqual(new Offset(8.1, 8.6))
  })
})
