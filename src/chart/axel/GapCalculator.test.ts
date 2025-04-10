import { Interval } from '../../model/Interval'
import { Range } from '../../model/Range'
import { Time, Duration } from '../../model/Time'
import { GapCalculator } from './GapCalculator'

describe('GapCalculator', () => {
  function createGapRange(start: Time, end: Time): Range {
    return new Range(start.toMillis(), end.toMillis())
  }

  function createGapCalculator(...intervals: Interval[]): GapCalculator {
    return new GapCalculator(intervals.map((interval) => createGapRange(interval.start, interval.end)))
  }

  const calculator1 = createGapCalculator(new Interval(Time.utc(2021, 6, 11), Time.utc(2021, 6, 13)))

  const calculator2 = createGapCalculator(
    new Interval(Time.utc(2021, 5, 28), Time.utc(2021, 6, 1)),
    new Interval(Time.utc(2021, 6, 7), Time.utc(2021, 6, 13))
  )

  const calculator3 = createGapCalculator(
    new Interval(Time.utc(2023, 3, 18), Time.utc(2023, 3, 20)),
    new Interval(Time.utc(2023, 3, 25), Time.utc(2023, 3, 27))
  )

  const calculator4 = createGapCalculator(
    new Interval(Time.utc(2023, 2, 7, 21, 0), Time.utc(2023, 2, 8, 14, 30)),
    new Interval(Time.utc(2023, 2, 8, 21, 0), Time.utc(2023, 2, 9, 14, 30)),
    new Interval(Time.utc(2023, 2, 9, 21, 0), Time.utc(2023, 2, 10, 14, 30)),
    new Interval(Time.utc(2023, 2, 10, 21, 0), Time.utc(2023, 2, 13, 14, 30)),
    new Interval(Time.utc(2023, 2, 13, 21, 0), Time.utc(2023, 2, 14, 14, 30)),
    new Interval(Time.utc(2023, 2, 14, 21, 0), Time.utc(2023, 2, 15, 14, 30))
  )

  test('should snap out of gap', () => {
    expect(calculator4.snap(Time.utc(2023, 2, 6).toMillis())).toBe(Time.utc(2023, 2, 6).toMillis())
    expect(calculator4.snap(Time.utc(2023, 2, 9, 20, 0).toMillis())).toBe(Time.utc(2023, 2, 9, 20, 0).toMillis())
    expect(calculator4.snap(Time.utc(2023, 2, 9, 21, 0).toMillis())).toBe(Time.utc(2023, 2, 10, 14, 30).toMillis())
    expect(calculator4.snap(Time.utc(2023, 2, 9, 21, 5).toMillis())).toBe(Time.utc(2023, 2, 10, 14, 30).toMillis())
    expect(calculator4.snap(Time.utc(2023, 2, 10).toMillis())).toBe(Time.utc(2023, 2, 10, 14, 30).toMillis())
    expect(calculator4.snap(Time.utc(2023, 2, 15).toMillis())).toBe(Time.utc(2023, 2, 15, 14, 30).toMillis())
    expect(calculator4.snap(Time.utc(2023, 2, 16).toMillis())).toBe(Time.utc(2023, 2, 16).toMillis())
  })

  test('should get gap amount partial', () => {
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 10).toMillis(), false, false)).toBe(0)
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 11).toMillis(), false, false)).toBe(0)
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 11, 12, 0).toMillis(), false, false)).toBe(
      Duration.forHours(12).toMillis()
    )
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 12).toMillis(), false, false)).toBe(
      Duration.forDays(1).toMillis()
    )
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 13).toMillis(), false, false)).toBe(
      Duration.forDays(2).toMillis()
    )
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 13, 12, 0).toMillis(), false, false)).toBe(
      Duration.forDays(2).toMillis()
    )
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 14).toMillis(), false, false)).toBe(
      Duration.forDays(2).toMillis()
    )

    expect(calculator2.getGapAmount(Time.utc(2021, 5, 28).toMillis(), false, false)).toBe(0)
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 29).toMillis(), false, false)).toBe(
      Duration.forDays(1).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 31).toMillis(), false, false)).toBe(
      Duration.forDays(3).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 1).toMillis(), false, false)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 2).toMillis(), false, false)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 6).toMillis(), false, false)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 7).toMillis(), false, false)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 8).toMillis(), false, false)).toBe(Duration.forDays(5).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 13).toMillis(), false, false)).toBe(
      Duration.forDays(10).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 14).toMillis(), false, false)).toBe(
      Duration.forDays(10).toMillis()
    )
  })

  test('should get gap amount full', () => {
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 10).toMillis(), false, true)).toBe(0)
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 11).toMillis(), false, true)).toBe(Duration.forDays(2).toMillis())
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 11, 12, 0).toMillis(), false, true)).toBe(
      Duration.forDays(2).toMillis()
    )
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 12).toMillis(), false, true)).toBe(Duration.forDays(2).toMillis())
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 13).toMillis(), false, true)).toBe(Duration.forDays(2).toMillis())
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 13, 12, 0).toMillis(), false, true)).toBe(
      Duration.forDays(2).toMillis()
    )
    expect(calculator1.getGapAmount(Time.utc(2021, 6, 14).toMillis(), false, true)).toBe(Duration.forDays(2).toMillis())

    expect(calculator2.getGapAmount(Time.utc(2021, 5, 27).toMillis(), false, true)).toBe(0)
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 28).toMillis(), false, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 29).toMillis(), false, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 31).toMillis(), false, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 1).toMillis(), false, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 2).toMillis(), false, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 6).toMillis(), false, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 7).toMillis(), false, true)).toBe(Duration.forDays(10).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 7, 0, 5).toMillis(), false, true)).toBe(
      Duration.forDays(10).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 8).toMillis(), false, true)).toBe(Duration.forDays(10).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 13).toMillis(), false, true)).toBe(
      Duration.forDays(10).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 14).toMillis(), false, true)).toBe(
      Duration.forDays(10).toMillis()
    )

    expect(calculator4.getGapAmount(Time.utc(2023, 2, 9, 14, 25).toMillis(), false, true)).toBe(
      Duration.forHours(17.5).miltiply(2).toMillis()
    )
    expect(calculator4.getGapAmount(Time.utc(2023, 2, 9, 14, 30).toMillis(), false, true)).toBe(
      Duration.forHours(17.5).miltiply(2).toMillis()
    )
    expect(calculator4.getGapAmount(Time.utc(2023, 2, 9, 14, 35).toMillis(), false, true)).toBe(
      Duration.forHours(17.5).miltiply(2).toMillis()
    )
    expect(calculator4.getGapAmount(Time.utc(2023, 2, 9, 20, 55).toMillis(), false, true)).toBe(
      Duration.forHours(17.5).miltiply(2).toMillis()
    )
    expect(calculator4.getGapAmount(Time.utc(2023, 2, 9, 21, 0).toMillis(), false, true)).toBe(
      Duration.forHours(17.5).miltiply(3).toMillis()
    )
    expect(calculator4.getGapAmount(Time.utc(2023, 2, 10).toMillis(), false, true)).toBe(
      Duration.forHours(17.5).miltiply(3).toMillis()
    )
  })

  test('should get gap amount between partial', () => {
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 11).toMillis(), false, false)
    ).toBe(0)
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 12).toMillis(), false, false)
    ).toBe(Duration.forDays(1).toMillis())
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 13).toMillis(), false, false)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 14).toMillis(), false, false)
    ).toBe(Duration.forDays(2).toMillis())

    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 30).toMillis(), Time.utc(2021, 5, 31).toMillis(), false, false)
    ).toBe(Duration.forDays(1).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 30).toMillis(), Time.utc(2021, 6, 1).toMillis(), false, false)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 30).toMillis(), Time.utc(2021, 6, 2).toMillis(), false, false)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 3).toMillis(), Time.utc(2021, 6, 5).toMillis(), false, false)
    ).toBe(0)
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 6).toMillis(), Time.utc(2021, 6, 8).toMillis(), false, false)
    ).toBe(Duration.forDays(1).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 13).toMillis(), Time.utc(2021, 6, 15).toMillis(), false, false)
    ).toBe(0)
  })

  test('should get gap amount between full', () => {
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 9).toMillis(), Time.utc(2021, 6, 10).toMillis(), false, true)
    ).toBe(0)
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 11).toMillis(), false, true)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 12).toMillis(), false, true)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 13).toMillis(), false, true)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator1.getGapAmountBetween(Time.utc(2021, 6, 10).toMillis(), Time.utc(2021, 6, 14).toMillis(), false, true)
    ).toBe(Duration.forDays(2).toMillis())

    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 30).toMillis(), Time.utc(2021, 5, 31).toMillis(), false, true)
    ).toBe(Duration.forDays(4).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 30).toMillis(), Time.utc(2021, 6, 1).toMillis(), false, true)
    ).toBe(Duration.forDays(4).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 30).toMillis(), Time.utc(2021, 6, 2).toMillis(), false, true)
    ).toBe(Duration.forDays(4).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 3).toMillis(), Time.utc(2021, 6, 5).toMillis(), false, true)
    ).toBe(0)
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 6).toMillis(), Time.utc(2021, 6, 8).toMillis(), false, true)
    ).toBe(Duration.forDays(6).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 13).toMillis(), Time.utc(2021, 6, 16).toMillis(), false, true)
    ).toBe(Duration.forDays(6).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 14).toMillis(), Time.utc(2021, 6, 16).toMillis(), false, true)
    ).toBe(0)
  })

  test('should get gap amount projected', () => {
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 29).toMillis(), true, false)).toBe(Duration.forDays(1).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 31).toMillis(), true, false)).toBe(Duration.forDays(3).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 6).toMillis(), true, false)).toBe(
      Duration.forDays(4 + 3).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 15).toMillis(), true, false)).toBe(
      Duration.forDays(4 + 6).toMillis()
    )

    expect(calculator2.getGapAmount(Time.utc(2021, 5, 29).toMillis(), true, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 5, 31).toMillis(), true, true)).toBe(Duration.forDays(4).toMillis())
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 6).toMillis(), true, true)).toBe(
      Duration.forDays(4 + 6).toMillis()
    )
    expect(calculator2.getGapAmount(Time.utc(2021, 6, 15).toMillis(), true, true)).toBe(
      Duration.forDays(4 + 6).toMillis()
    )

    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 25).toMillis(), Time.utc(2021, 5, 29).toMillis(), true, false)
    ).toBe(Duration.forDays(1).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 29).toMillis(), Time.utc(2021, 5, 31).toMillis(), true, false)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 29).toMillis(), Time.utc(2021, 6, 6).toMillis(), true, false)
    ).toBe(Duration.forDays(3 + 2).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 6).toMillis(), Time.utc(2021, 6, 15).toMillis(), true, false)
    ).toBe(Duration.forDays(6).toMillis())

    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 25).toMillis(), Time.utc(2021, 5, 29).toMillis(), true, true)
    ).toBe(Duration.forDays(4).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 29).toMillis(), Time.utc(2021, 5, 31).toMillis(), true, true)
    ).toBe(Duration.forDays(4).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 5, 29).toMillis(), Time.utc(2021, 6, 6).toMillis(), true, true)
    ).toBe(Duration.forDays(4 + 6).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 2).toMillis(), Time.utc(2021, 6, 7).toMillis(), true, true)
    ).toBe(Duration.forDays(6).toMillis())
    expect(
      calculator2.getGapAmountBetween(Time.utc(2021, 6, 6).toMillis(), Time.utc(2021, 6, 15).toMillis(), true, true)
    ).toBe(Duration.forDays(6).toMillis())
  })

  test('should get gap amount projected to next gap', () => {
    expect(
      calculator3.getGapAmountBetween(Time.utc(2023, 3, 16).toMillis(), Time.utc(2023, 3, 22).toMillis(), true, true)
    ).toBe(Duration.forDays(2).toMillis())
    expect(
      calculator3.getGapAmountBetween(Time.utc(2023, 3, 16).toMillis(), Time.utc(2023, 3, 23).toMillis(), true, true)
    ).toBe(Duration.forDays(4).toMillis())
    expect(
      calculator3.getGapAmountBetween(Time.utc(2023, 3, 16).toMillis(), Time.utc(2023, 3, 24).toMillis(), true, true)
    ).toBe(Duration.forDays(4).toMillis())
  })
})
