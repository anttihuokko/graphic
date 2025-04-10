import { Size } from './Size'

describe('Size', () => {
  test('shoud check if Size is zero', () => {
    expect(Size.ZERO.isZero()).toBe(true)
    expect(new Size(0, 0).isZero()).toBe(true)
    expect(new Size(1, 0).isZero()).toBe(false)
    expect(new Size(0, 1).isZero()).toBe(false)
    expect(new Size(1, 1).isZero()).toBe(false)
  })
})
