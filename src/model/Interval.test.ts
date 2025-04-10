import { Time, Duration } from './Time'
import { Interval } from './Interval'

describe('Interval', () => {
  function assertTime(actual: Time, expected: Time) {
    expect(actual.toMillis()).toBe(expected.toMillis())
  }

  function assertInterval(interval: Interval, startTime: Time, endTime: Time) {
    assertTime(interval.start, startTime)
    assertTime(interval.end, endTime)
  }

  test('should create Interval for duration', () => {
    assertInterval(
      Interval.forDuration(Time.fromISO('2019-01-01'), Duration.forDays(5)),
      Time.fromISO('2019-01-01'),
      Time.fromISO('2019-01-06')
    )
    assertInterval(
      Interval.forDuration(Time.fromISO('2019-01-10'), Duration.forDays(-5)),
      Time.fromISO('2019-01-05'),
      Time.fromISO('2019-01-10')
    )
  })

  test('merge intervals', () => {
    assertInterval(
      Interval.merge(new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-06'))),
      Time.fromISO('2019-01-01'),
      Time.fromISO('2019-01-06')
    )
    assertInterval(
      Interval.merge(
        new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-06')),
        new Interval(Time.fromISO('2019-01-02'), Time.fromISO('2019-01-04'))
      ),
      Time.fromISO('2019-01-01'),
      Time.fromISO('2019-01-06')
    )
    assertInterval(
      Interval.merge(
        new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-06')),
        new Interval(Time.fromISO('2019-01-06'), Time.fromISO('2019-01-08')),
        new Interval(Time.fromISO('2019-01-08'), Time.fromISO('2019-01-10'))
      ),
      Time.fromISO('2019-01-01'),
      Time.fromISO('2019-01-10')
    )
    assertInterval(
      Interval.merge(
        new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-06')),
        new Interval(Time.fromISO('2019-01-08'), Time.fromISO('2019-01-10'))
      ),
      Time.fromISO('2019-01-01'),
      Time.fromISO('2019-01-10')
    )
  })

  test('should get middle time of Interval', () => {
    assertTime(
      new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-20')).getMiddleTime(),
      Time.fromISO('2019-01-15')
    )
    assertTime(
      new Interval(Time.fromISO('2020-06-20'), Time.fromISO('2020-07-10')).getMiddleTime(),
      Time.fromISO('2020-06-30')
    )
  })

  test('should check for empty Interval', () => {
    expect(Interval.EMPTY.isEmpty()).toBe(true)
    expect(new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-01')).isEmpty()).toBe(true)
    expect(new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-02')).isEmpty()).toBe(false)
  })

  test('should check if Interval contains a time', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    expect(i.contains(Time.fromISO('2019-01-09'))).toBe(false)
    expect(i.contains(Time.fromISO('2019-01-10'))).toBe(true)
    expect(i.contains(Time.fromISO('2019-01-11'))).toBe(true)
    expect(i.contains(Time.fromISO('2019-01-14'))).toBe(true)
    expect(i.contains(Time.fromISO('2019-01-15'))).toBe(true)
    expect(i.contains(Time.fromISO('2019-01-16'))).toBe(false)
  })

  test('should check if same as other Interval', () => {
    expect(Interval.EMPTY.isSame(Interval.EMPTY)).toBe(true)
    expect(
      new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')).isSame(
        new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
      )
    ).toBe(true)
    expect(
      new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')).isSame(
        new Interval(Time.fromISO('2019-01-09'), Time.fromISO('2019-01-15'))
      )
    ).toBe(false)
    expect(
      new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')).isSame(
        new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-16'))
      )
    ).toBe(false)
    expect(
      new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')).isSame(
        new Interval(Time.fromISO('2019-01-09'), Time.fromISO('2019-01-16'))
      )
    ).toBe(false)
  })

  test('should check if Interval encloses other', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    expect(i.encloses(Interval.EMPTY)).toBe(false)
    expect(i.encloses(new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')))).toBe(true)
    expect(i.encloses(new Interval(Time.fromISO('2019-01-09'), Time.fromISO('2019-01-15')))).toBe(false)
    expect(i.encloses(new Interval(Time.fromISO('2019-01-11'), Time.fromISO('2019-01-15')))).toBe(true)
    expect(i.encloses(new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-14')))).toBe(true)
    expect(i.encloses(new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-16')))).toBe(false)
  })

  test('should check if Interval intersects other', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    expect(i.intersectsWith(Interval.EMPTY)).toBe(false)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')))).toBe(true)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-11'), Time.fromISO('2019-01-14')))).toBe(true)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-09')))).toBe(false)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-10')))).toBe(true)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-11')))).toBe(true)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-14'), Time.fromISO('2019-01-20')))).toBe(true)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-15'), Time.fromISO('2019-01-20')))).toBe(true)
    expect(i.intersectsWith(new Interval(Time.fromISO('2019-01-16'), Time.fromISO('2019-01-20')))).toBe(false)
  })

  test('should check if Interval continuous with other', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    expect(i.isContinuousWith(Interval.EMPTY)).toBe(false)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-09')))).toBe(false)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-10')))).toBe(true)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-01'), Time.fromISO('2019-01-11')))).toBe(true)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15')))).toBe(true)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-11'), Time.fromISO('2019-01-14')))).toBe(true)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-14'), Time.fromISO('2019-01-20')))).toBe(true)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-15'), Time.fromISO('2019-01-20')))).toBe(true)
    expect(i.isContinuousWith(new Interval(Time.fromISO('2019-01-16'), Time.fromISO('2019-01-20')))).toBe(false)
    expect(
      new Interval(Time.fromISO('2019-09-01'), Time.fromISO('2019-09-18')).isContinuousWith(
        new Interval(Time.fromISO('2019-07-03'), Time.fromISO('2019-09-01'))
      )
    ).toBe(true)
  })

  it('should cut Interval from start', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromMillis(0)), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromISO('2019-01-09')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromISO('2019-01-10')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromISO('2019-01-11')), Time.fromISO('2019-01-11'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromISO('2019-01-14')), Time.fromISO('2019-01-14'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromISO('2019-01-15')), Time.fromISO('2019-01-15'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutStart(Time.fromISO('2019-01-16')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
  })

  test('should cut Interval from end', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutEnd(Time.fromMillis(0)), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutEnd(Time.fromISO('2019-01-16')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutEnd(Time.fromISO('2019-01-15')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    assertInterval(i.cutEnd(Time.fromISO('2019-01-14')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-14'))
    assertInterval(i.cutEnd(Time.fromISO('2019-01-11')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-11'))
    assertInterval(i.cutEnd(Time.fromISO('2019-01-10')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-10'))
    assertInterval(i.cutEnd(Time.fromISO('2019-01-09')), Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
  })

  test('should get intersection with other Interval', () => {
    const i = new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))
    expect(i.intersection(Interval.EMPTY).isEmpty()).toBe(true)
    assertInterval(
      i.intersection(new Interval(Time.fromISO('2019-01-10'), Time.fromISO('2019-01-15'))),
      Time.fromISO('2019-01-10'),
      Time.fromISO('2019-01-15')
    )
    assertInterval(
      i.intersection(new Interval(Time.fromISO('2019-01-11'), Time.fromISO('2019-01-14'))),
      Time.fromISO('2019-01-11'),
      Time.fromISO('2019-01-14')
    )
    expect(i.intersection(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-09'))).isEmpty()).toBe(true)
    expect(i.intersection(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-10'))).isEmpty()).toBe(true)
    assertInterval(
      i.intersection(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-11'))),
      Time.fromISO('2019-01-10'),
      Time.fromISO('2019-01-11')
    )
    assertInterval(
      i.intersection(new Interval(Time.fromISO('2019-01-05'), Time.fromISO('2019-01-12'))),
      Time.fromISO('2019-01-10'),
      Time.fromISO('2019-01-12')
    )
    assertInterval(
      i.intersection(new Interval(Time.fromISO('2019-01-13'), Time.fromISO('2019-01-20'))),
      Time.fromISO('2019-01-13'),
      Time.fromISO('2019-01-15')
    )
    assertInterval(
      i.intersection(new Interval(Time.fromISO('2019-01-14'), Time.fromISO('2019-01-20'))),
      Time.fromISO('2019-01-14'),
      Time.fromISO('2019-01-15')
    )
    expect(i.intersection(new Interval(Time.fromISO('2019-01-15'), Time.fromISO('2019-01-20'))).isEmpty()).toBe(true)
    expect(i.intersection(new Interval(Time.fromISO('2019-01-16'), Time.fromISO('2019-01-20'))).isEmpty()).toBe(true)
  })
})
