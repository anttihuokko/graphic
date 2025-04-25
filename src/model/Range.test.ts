import { Range } from './Range'

describe('Range', () => {
  test('should create Range for number array min and max', () => {
    expect(Range.forValues([5]).isSame(new Range(5, 5))).toBe(true)
    expect(Range.forValues([10, -2, 8, 0, -10, 1, 2]).isSame(new Range(-10, 10))).toBe(true)
  })

  test('should get max Range for Range array', () => {
    expect(Range.max([]).isSame(Range.EMPTY)).toBe(true)
    expect(Range.max([new Range(1, 1)]).isSame(new Range(1, 1))).toBe(true)
    expect(
      Range.max([new Range(1, 1), new Range(-10, 5), new Range(6, 10), new Range(-8, 8)]).isSame(new Range(-10, 10))
    ).toBe(true)
  })

  test('should get size for Range', () => {
    expect(Range.EMPTY.size).toBe(0)
    expect(new Range(1, 1).size).toBe(0)
    expect(new Range(1, 2).size).toBe(1)
    expect(new Range(0.2, 0.4).size).toBe(0.2)
    expect(new Range(5, 8).size).toBe(3)
    expect(new Range(0, 100).size).toBe(100)
    expect(new Range(-5, 5).size).toBe(10)
    expect(new Range(-50, -10).size).toBe(40)
  })

  test('should get middle of Range', () => {
    expect(new Range(1, 1).middle).toBe(1)
    expect(new Range(1, 2).middle).toBe(1.5)
    expect(new Range(0.2, 0.4).middle).toBeCloseTo(0.3)
    expect(new Range(5, 8).middle).toBe(6.5)
    expect(new Range(0, 100).middle).toBe(50)
    expect(new Range(-5, 5).middle).toBe(0)
    expect(new Range(-50, -10).middle).toBe(-30)
  })

  test('should check if Range is empty', () => {
    expect(Range.EMPTY.isEmpty()).toBe(true)
    expect(new Range(1, 1).isEmpty()).toBe(true)
    expect(new Range(0, 1).isEmpty()).toBe(false)
  })

  test('should check if Range contains value', () => {
    expect(new Range(-5, 5).contains(-6)).toBe(false)
    expect(new Range(-5, 5).contains(-5)).toBe(true)
    expect(new Range(-5, 5).contains(0)).toBe(true)
    expect(new Range(-5, 5).contains(5)).toBe(true)
    expect(new Range(-5, 5).contains(6)).toBe(false)
  })

  test('should check if Range is before other Range', () => {
    expect(new Range(1, 2).isBefore(new Range(1, 2))).toBe(false)
    expect(new Range(5, 6).isBefore(new Range(1, 10))).toBe(false)
    expect(new Range(1, 4).isBefore(new Range(5, 10))).toBe(true)
    expect(new Range(1, 5).isBefore(new Range(5, 10))).toBe(false)
    expect(new Range(1, 6).isBefore(new Range(5, 10))).toBe(false)
    expect(new Range(9, 15).isBefore(new Range(5, 10))).toBe(false)
    expect(new Range(10, 15).isBefore(new Range(5, 10))).toBe(false)
    expect(new Range(11, 15).isBefore(new Range(5, 10))).toBe(false)
  })

  test('should check if Range is after other Range', () => {
    expect(new Range(1, 2).isAfter(new Range(1, 2))).toBe(false)
    expect(new Range(5, 6).isAfter(new Range(1, 10))).toBe(false)
    expect(new Range(1, 4).isAfter(new Range(5, 10))).toBe(false)
    expect(new Range(1, 5).isAfter(new Range(5, 10))).toBe(false)
    expect(new Range(1, 6).isAfter(new Range(5, 10))).toBe(false)
    expect(new Range(9, 15).isAfter(new Range(5, 10))).toBe(false)
    expect(new Range(10, 15).isAfter(new Range(5, 10))).toBe(false)
    expect(new Range(11, 15).isAfter(new Range(5, 10))).toBe(true)
  })

  test('should check if same as other Range', () => {
    expect(new Range(1, 2).isSame(new Range(1, 2))).toBe(true)
    expect(new Range(1, 1).isSame(new Range(1, 2))).toBe(false)
    expect(new Range(1, 1).isSame(new Range(2, 1))).toBe(false)
    expect(new Range(1, 1).isSame(new Range(2, 2))).toBe(false)
  })

  test('should check if encloses other Range', () => {
    expect(new Range(1, 1).encloses(new Range(1, 1))).toBe(true)
    expect(new Range(4, 8).encloses(new Range(3, 8))).toBe(false)
    expect(new Range(4, 8).encloses(new Range(4, 8))).toBe(true)
    expect(new Range(4, 8).encloses(new Range(5, 8))).toBe(true)
    expect(new Range(4, 8).encloses(new Range(4, 7))).toBe(true)
    expect(new Range(4, 8).encloses(new Range(4, 8))).toBe(true)
    expect(new Range(4, 8).encloses(new Range(4, 9))).toBe(false)
  })

  test('should check if Range intersects with other Range', () => {
    expect(new Range(1, 2).intersectsWith(new Range(1, 2))).toBe(true)
    expect(new Range(5, 6).intersectsWith(new Range(1, 10))).toBe(true)
    expect(new Range(1, 4).intersectsWith(new Range(5, 10))).toBe(false)
    expect(new Range(1, 5).intersectsWith(new Range(5, 10))).toBe(true)
    expect(new Range(1, 6).intersectsWith(new Range(5, 10))).toBe(true)
    expect(new Range(9, 15).intersectsWith(new Range(5, 10))).toBe(true)
    expect(new Range(10, 15).intersectsWith(new Range(5, 10))).toBe(true)
    expect(new Range(11, 15).intersectsWith(new Range(5, 10))).toBe(false)
  })

  test('should grow Range start by amount', () => {
    expect(new Range(1, 2).growStart(1).isSame(new Range(0, 2))).toBe(true)
    expect(new Range(5, 10).growStart(3).isSame(new Range(2, 10))).toBe(true)
  })

  test('should grow Range end by amount', () => {
    expect(new Range(1, 2).growEnd(1).isSame(new Range(1, 3))).toBe(true)
    expect(new Range(5, 10).growEnd(3).isSame(new Range(5, 13))).toBe(true)
  })

  test('should grow Range by amount', () => {
    expect(new Range(1, 2).grow(1).isSame(new Range(0, 3))).toBe(true)
    expect(new Range(5, 10).grow(3).isSame(new Range(2, 13))).toBe(true)
  })

  test('should get Range intersection other Range', () => {
    expect(new Range(1, 2).intersection(new Range(1, 2)).isSame(new Range(1, 2))).toBe(true)
    expect(new Range(5, 6).intersection(new Range(1, 10)).isSame(new Range(5, 6))).toBe(true)
    expect(new Range(1, 4).intersection(new Range(5, 10)).isEmpty()).toBe(true)
    expect(new Range(1, 5).intersection(new Range(5, 10)).isSame(new Range(5, 5))).toBe(true)
    expect(new Range(1, 6).intersection(new Range(5, 10)).isSame(new Range(5, 6))).toBe(true)
    expect(new Range(9, 15).intersection(new Range(5, 10)).isSame(new Range(9, 10))).toBe(true)
    expect(new Range(10, 15).intersection(new Range(5, 10)).isSame(new Range(10, 10))).toBe(true)
    expect(new Range(11, 15).intersection(new Range(5, 10)).isEmpty()).toBe(true)
  })
})
