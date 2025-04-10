import { DateTime } from 'luxon'
import { Time, Duration } from './Time'

describe('Duration', () => {
  test('shoud negate', () => {
    expect(Duration.forMinutes(2).negate()).toStrictEqual(Duration.forMinutes(-2))
  })

  test('shoud plus milliseconds', () => {
    expect(Duration.forMillis(10).plus(5)).toStrictEqual(Duration.forMillis(15))
  })

  test('shoud plus Duration', () => {
    expect(Duration.forMillis(10).plus(Duration.forMillis(5))).toStrictEqual(Duration.forMillis(15))
  })

  test('shoud minus milliseconds', () => {
    expect(Duration.forMillis(10).minus(5)).toStrictEqual(Duration.forMillis(5))
  })

  test('shoud minus Duration', () => {
    expect(Duration.forMillis(10).minus(Duration.forMillis(5))).toStrictEqual(Duration.forMillis(5))
  })

  test('shoud multiply', () => {
    expect(Duration.forHours(10).miltiply(2)).toStrictEqual(Duration.forHours(20))
  })

  test('shoud divide', () => {
    expect(Duration.forHours(10).divide(2)).toStrictEqual(Duration.forHours(5))
    expect(Duration.forMillis(9).divide(2)).toStrictEqual(Duration.forMillis(5))
  })

  test('shoud check if equal', () => {
    expect(Duration.forHours(2).equals(Duration.forMinutes(120))).toBe(true)
    expect(Duration.forMinutes(2).equals(Duration.forMinutes(122))).toBe(false)
  })

  test('shoud get millis', () => {
    expect(Duration.forMillis(10).toMillis()).toBe(10)
    expect(Duration.forMinutes(2).toMillis()).toBe(120000)
  })

  test('shoud get minutes', () => {
    expect(Duration.forMillis(6000).toMinutes()).toBe(0.1)
    expect(Duration.forHours(2).toMinutes()).toBe(120)
  })

  test('shoud get hours', () => {
    expect(Duration.forMinutes(6).toHours()).toBe(0.1)
    expect(Duration.forDays(2).toHours()).toBe(48)
  })

  test('shoud get days', () => {
    expect(Duration.forHours(2.4).toDays()).toBe(0.1)
    expect(Duration.forDays(2).toDays()).toBe(2)
  })

  test('shoud format', () => {
    expect(Duration.forMinutes(5).format()).toBe('PT300S')
    expect(Duration.forMinutes(5).format('hh:mm')).toBe('00:05')
  })
})

describe('Time', () => {
  function assert(expected: DateTime, actual: Time) {
    expect(actual.toDateTime()).toStrictEqual(expected)
    expect(actual.toMillis()).toBe(expected.toMillis())
  }

  test('shoud create Time from utc year month day', () => {
    assert(DateTime.utc(2021, 12, 24), Time.utc(2021, 12, 24))
  })

  test('shoud create Time from ISO string', () => {
    assert(DateTime.fromISO('2019-01-06', { zone: 'UTC' }), Time.fromISO('2019-01-06'))
  })

  test('shoud create Time from DateTime', () => {
    const dateTime = DateTime.utc(2020, 6, 20, 10, 50)
    assert(dateTime, Time.fromDateTime(dateTime))
  })

  test('shoud create Time from millis', () => {
    assert(DateTime.fromMillis(12345678, { zone: 'UTC' }), Time.fromMillis(12345678))
  })

  test('shoud get min Time', () => {
    const result = Time.min(Time.fromMillis(10000), Time.fromMillis(1), Time.now())
    expect(result).toStrictEqual(Time.fromMillis(1))
  })

  test('shoud get max Time', () => {
    const result = Time.max(Time.fromMillis(10000), Time.fromMillis(1), Time.fromMillis(100))
    expect(result).toStrictEqual(Time.fromMillis(10000))
  })

  test('shoud get individual units of time', () => {
    expect(Time.fromISO('2021-02-08T10:11').year).toBe(2021)
    expect(Time.fromISO('2021-02-08T10:11').month).toBe(2)
    expect(Time.fromISO('2021-02-08T10:11').day).toBe(8)
    expect(Time.fromISO('2021-02-08T10:11').hour).toBe(10)
    expect(Time.fromISO('2021-02-08T10:11').minute).toBe(11)
  })

  test('shoud get Time at start of time unit', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').startOf('day')).toStrictEqual(Time.fromISO('2021-02-08'))
    expect(Time.fromISO('2021-02-08T10:11:12').startOf('hour')).toStrictEqual(Time.fromISO('2021-02-08T10:00:00'))
    expect(Time.fromISO('2021-02-08T10:11:12').startOf('minute')).toStrictEqual(Time.fromISO('2021-02-08T10:11:00'))
  })

  test('shoud get Time at end of time unit', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').endOf('day')).toStrictEqual(Time.fromISO('2021-02-08T23:59:59.999'))
    expect(Time.fromISO('2021-02-08T10:11:12').endOf('hour')).toStrictEqual(Time.fromISO('2021-02-08T10:59:59.999'))
    expect(Time.fromISO('2021-02-08T10:11:12').endOf('minute')).toStrictEqual(Time.fromISO('2021-02-08T10:11:59.999'))
  })

  test('shoud plus milliseconds', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').plus(Duration.forMinutes(3).toMillis())).toStrictEqual(
      Time.fromISO('2021-02-08T10:14:12')
    )
    expect(Time.fromISO('2021-02-08T10:11:12').plus(Duration.forHours(2).toMillis())).toStrictEqual(
      Time.fromISO('2021-02-08T12:11:12')
    )
  })

  test('shoud plus Duration', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').plus(Duration.forMinutes(3))).toStrictEqual(
      Time.fromISO('2021-02-08T10:14:12')
    )
    expect(Time.fromISO('2021-02-08T10:11:12').plus(Duration.forHours(2))).toStrictEqual(
      Time.fromISO('2021-02-08T12:11:12')
    )
  })

  test('shoud minus milliseconds', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').minus(Duration.forMinutes(3).toMillis())).toStrictEqual(
      Time.fromISO('2021-02-08T10:08:12')
    )
    expect(Time.fromISO('2021-02-08T10:11:12').minus(Duration.forHours(2).toMillis())).toStrictEqual(
      Time.fromISO('2021-02-08T08:11:12')
    )
  })

  test('shoud minus Duration', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').minus(Duration.forMinutes(3))).toStrictEqual(
      Time.fromISO('2021-02-08T10:08:12')
    )
    expect(Time.fromISO('2021-02-08T10:11:12').minus(Duration.forHours(2))).toStrictEqual(
      Time.fromISO('2021-02-08T08:11:12')
    )
  })

  test('shoud diff', () => {
    expect(Time.fromISO('2021-02-08T10:14').diff(Time.fromISO('2021-02-08T10:12'))).toStrictEqual(
      Duration.forMinutes(2)
    )
    expect(Time.fromISO('2021-02-08T12:50').diff(Time.fromISO('2021-02-08T13:55'))).toStrictEqual(
      Duration.forHours(1).plus(Duration.forMinutes(5)).negate()
    )
  })

  test('shoud check if equal', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').equals(Time.fromISO('2021-02-08T10:11:12'))).toBe(true)
    expect(Time.fromISO('2021-02-08T10:11:14').equals(Time.fromISO('2021-02-08T10:11:12'))).toBe(false)
  })

  test('shoud get milliseconds', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').toMillis()).toBe(
      DateTime.fromISO('2021-02-08T10:11:12', { zone: 'UTC' }).toMillis()
    )
  })

  test('shoud format', () => {
    expect(Time.fromISO('2021-02-08T10:11:12').format()).toBe('2021-02-08T10:11:12.000Z')
    expect(Time.fromISO('2021-02-08T10:11:12').format('yyyy.MM.dd')).toBe('2021.02.08')
  })
})
