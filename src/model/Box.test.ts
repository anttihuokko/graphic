import { Box } from './Box'

describe('Box', () => {
  test('should return Box coordinates', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.left).toBe(2)
    expect(box.right).toBe(8)
    expect(box.top).toBe(3)
    expect(box.bottom).toBe(9)
    expect(box.centerX).toBe(5)
    expect(box.centerY).toBe(6)
  })

  test('should check if coordinates contained in Box', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.contains(1, 2)).toBe(false)
    expect(box.contains(2, 3)).toBe(true)
    expect(box.contains(8, 9)).toBe(true)
    expect(box.contains(9, 9)).toBe(false)
  })

  test('should move Box location', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.move(1, 2)).toEqual(new Box(1, 2, 6, 6))
    expect(box.move(-5, 5)).toEqual(new Box(-5, 5, 6, 6))
  })

  test('should grow Box', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.grow(1)).toEqual(new Box(1, 2, 8, 8))
    expect(box.grow(3)).toEqual(new Box(-1, 0, 12, 12))
  })

  test('should shrink Box', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.shrink(1)).toEqual(new Box(3, 4, 4, 4))
    expect(box.shrink(3)).toEqual(new Box(5, 6, 0, 0))
  })

  test('should cut left of Box', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.cutLeft(1)).toEqual(box)
    expect(box.cutLeft(2)).toEqual(box)
    expect(box.cutLeft(3)).toEqual(new Box(3, 3, 5, 6))
    expect(box.cutLeft(7)).toEqual(new Box(7, 3, 1, 6))
    expect(box.cutLeft(8)).toEqual(box)
    expect(box.cutLeft(9)).toEqual(box)
  })

  test('should cut right of Box', () => {
    const box = new Box(2, 3, 6, 6)
    expect(box.cutRight(1)).toEqual(box)
    expect(box.cutRight(2)).toEqual(box)
    expect(box.cutRight(3)).toEqual(new Box(2, 3, 1, 6))
    expect(box.cutRight(7)).toEqual(new Box(2, 3, 5, 6))
    expect(box.cutRight(8)).toEqual(box)
    expect(box.cutRight(9)).toEqual(box)
  })
})
