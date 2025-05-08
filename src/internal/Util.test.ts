import { Time } from '../model/Time'
import { Util } from './Util'

type FunctionCall = { callId: number; callWaitTime: number; testStartTime: Time; callTime: Time }

function callThrottledFunction(
  throttleWaitTime: number,
  callWaitTimes: number[],
  totalWaitTime: number
): Promise<FunctionCall[]> {
  const calls: FunctionCall[] = []
  const throttledFunction = Util.throttle((callId: number, callWaitTime: number, testStartTime: Time) => {
    calls.push({ callId, callWaitTime, testStartTime, callTime: Time.now() })
  }, throttleWaitTime)
  for (let i = 0; i < callWaitTimes.length; i++) {
    setTimeout(() => {
      throttledFunction(i + 1, callWaitTimes[i], Time.now())
    }, callWaitTimes[i])
  }
  return new Promise((resolve) => setTimeout(() => resolve(calls), totalWaitTime))
}

describe('Util', () => {
  test('should find mapped value', () => {
    expect(Util.findMappedValue([], (value) => value)).toBe(undefined)
    expect(Util.findMappedValue([{ a: 1, b: 2 }], (value) => value.a)).toBe(1)
    expect(
      Util.findMappedValue(
        [
          { a: 1, b: 2 },
          { a: -1, b: -2 },
          { a: 10, b: 20 },
          { a: -10, b: -20 },
          { a: 11, b: 22 },
        ],
        (value) => (value.a === 10 ? value.a : undefined)
      )
    ).toBe(10)
  })

  test('should throttle', async () => {
    const calls1 = await callThrottledFunction(50, [100, 200, 300, 400, 500], 1000)
    expect(calls1.map((call) => call.callId)).toEqual([1, 2, 3, 4, 5])
    const calls2 = await callThrottledFunction(100, [10, 20, 30, 40, 50], 200)
    expect(calls2.map((call) => call.callId)).toEqual([1, 5])
    const calls3 = await callThrottledFunction(50, [10, 20, 30, 90, 100], 200)
    expect(calls3.map((call) => call.callId)).toEqual([1, 3, 5])
    const calls4 = await callThrottledFunction(50, [10, 20, 30, 90, 140], 200)
    expect(calls4.map((call) => call.callId)).toEqual([1, 3, 4, 5])
  })

  test('should create unique ID', () => {
    expect(Util.uniqueId()).toBe('1')
    expect(Util.uniqueId('MYTEST-')).toBe('MYTEST-2')
  })

  test('should get first array element', () => {
    expect(Util.first([])).toBe(undefined)
    expect(Util.first([1])).toEqual(1)
    expect(Util.first([1, 2, 3])).toEqual(1)
  })

  test('should get last array element', () => {
    expect(Util.last([])).toBe(undefined)
    expect(Util.last([1])).toEqual(1)
    expect(Util.last([1, 2, 3])).toEqual(3)
  })

  test('should pull value for array', () => {
    expect(Util.pull([], 1)).toEqual([])
    expect(Util.pull([1], 1, 2, 3)).toEqual([])
    expect(Util.pull([1, 2, 3, 1, 2, 3], 1)).toEqual([2, 3, 2, 3])
    expect(Util.pull([1, 2, 3, 1, 2, 3], 1, 2)).toEqual([3, 3])
    expect(Util.pull([1, 2, 3, 1, 2, 3], 1, 2, 3, 4)).toEqual([])
  })

  test('should get min by', () => {
    expect(Util.minBy([], (value) => value)).toBe(undefined)
    expect(Util.minBy([{ a: 1, b: 2 }], (value) => value.a)).toEqual({ a: 1, b: 2 })
    expect(
      Util.minBy(
        [
          { a: 1, b: 2 },
          { a: -1, b: -2 },
          { a: 10, b: 20 },
          { a: -10, b: -20 },
          { a: 11, b: 22 },
        ],
        (value) => value.a
      )
    ).toEqual({ a: -10, b: -20 })
  })

  test('should get max by', () => {
    expect(Util.maxBy([], (value) => value)).toBe(undefined)
    expect(Util.maxBy([{ a: 1, b: 2 }], (value) => value.a)).toEqual({ a: 1, b: 2 })
    expect(
      Util.maxBy(
        [
          { a: 1, b: 2 },
          { a: -1, b: -2 },
          { a: 10, b: 20 },
          { a: -10, b: -20 },
          { a: 11, b: 22 },
        ],
        (value) => value.a
      )
    ).toEqual({ a: 11, b: 22 })
  })

  test('should sort by', () => {
    expect(Util.sortBy([], (value) => value)).toEqual([])
    expect(Util.sortBy([{ a: 1, b: 2 }], (value) => value.a)).toEqual([{ a: 1, b: 2 }])
    expect(
      Util.sortBy(
        [
          { a: 1, b: 2 },
          { a: -1, b: -2 },
          { a: 10, b: 20 },
          { a: -10, b: -20 },
          { a: 11, b: 22 },
          { a: -100, b: -200 },
        ],
        (value) => value.a,
        true
      )
    ).toEqual([
      { a: -100, b: -200 },
      { a: -10, b: -20 },
      { a: -1, b: -2 },
      { a: 1, b: 2 },
      { a: 10, b: 20 },
      { a: 11, b: 22 },
    ])
    expect(
      Util.sortBy(
        [
          { a: 1, b: 2 },
          { a: -1, b: -2 },
          { a: 10, b: 20 },
          { a: -10, b: -20 },
          { a: 11, b: 22 },
          { a: -100, b: -200 },
        ],
        (value) => value.a,
        false
      )
    ).toEqual([
      { a: 11, b: 22 },
      { a: 10, b: 20 },
      { a: 1, b: 2 },
      { a: -1, b: -2 },
      { a: -10, b: -20 },
      { a: -100, b: -200 },
    ])
  })

  test('should get uniq by', () => {
    expect(Util.uniqBy([], (value) => value)).toEqual([])
    expect(Util.uniqBy([{ a: 1, b: 2 }], (value) => value.a)).toEqual([{ a: 1, b: 2 }])
    expect(
      Util.uniqBy(
        [
          { a: 1, b: 1 },
          { a: 1, b: 2 },
          { a: 10, b: 10 },
          { a: 10, b: 20 },
          { a: 1, b: 3 },
          { a: 10, b: 30 },
          { a: 1, b: 1 },
        ],
        (value) => value.a
      )
    ).toEqual([
      { a: 1, b: 1 },
      { a: 10, b: 10 },
    ])
  })

  test('should check if object has a value', () => {
    expect(Util.hasValue('test', [])).toBe(false)
    expect(Util.hasValue('test', {})).toBe(false)
    expect(Util.hasValue('', {})).toBe(false)
    expect(Util.hasValue('111', {})).toBe(false)
    const testObject = { test1: 10, test2: null, test3: undefined, a: [{ b: { c: 3 } }] }
    expect(Util.hasValue('test1', testObject)).toBe(true)
    expect(Util.hasValue('test2', testObject)).toBe(true)
    expect(Util.hasValue('test3', testObject)).toBe(true)
    expect(Util.hasValue('a[0]', testObject)).toBe(true)
    expect(Util.hasValue('a[1]', testObject)).toBe(false)
    expect(Util.hasValue('a[0].b', testObject)).toBe(true)
    expect(Util.hasValue('a[0].b.c', testObject)).toBe(true)
    expect(Util.hasValue('a.b.c', testObject)).toBe(false)
  })

  test('should get value from objet', () => {
    expect(Util.getValue('test', [])).toBe(undefined)
    expect(Util.getValue('test', {})).toBe(undefined)
    expect(Util.getValue('', {})).toBe(undefined)
    expect(Util.getValue('111', {})).toBe(undefined)
    const testObject = { test1: 10, test2: null, test3: undefined, a: [{ b: { c: 3 } }] }
    expect(Util.getValue('test1', testObject)).toBe(10)
    expect(Util.getValue('test2', testObject)).toBe(null)
    expect(Util.getValue('test3', testObject)).toBe(undefined)
    expect(Util.getValue('a[0].b', testObject)).toEqual({ c: 3 })
    expect(Util.getValue('a[0].b.c', testObject)).toBe(3)
    expect(Util.getValue('a.b.c', testObject, 'default')).toBe('default')
  })
})
