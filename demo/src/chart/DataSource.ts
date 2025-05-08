import { DateTime } from 'luxon'
import { TimeSeriesDataSource } from '../../../src'

export function createDataSource(gaps: boolean): TimeSeriesDataSource {
  return {
    timeField: 'time',
    load: (time, beforeCount, afterCount, requestId) => {
      console.log('--- LOAD DATA', requestId, time.format(), beforeCount, afterCount)
      return new Promise((resolve) => {
        const result: { time: string; value1: number; value2: number }[] = []
        const requiredCount = beforeCount + 1 + afterCount
        let offset = -beforeCount
        while (result.length < requiredCount) {
          const currentTime = time.toDateTime().plus({ days: offset })
          if (!gaps || !getGapTimesForTest2().some((gapTime) => currentTime.equals(gapTime))) {
            result.push({
              time: currentTime.toISO() ?? '',
              // value: 100
              // value: 100 + Math.random() * 100
              // value: 100 + Math.random() * 100 * result.length
              value1: result.length % 2 === 0 ? 0 : 4000,
              value2: result.length % 2 === 0 ? -1 : 2,
            })
          }
          offset++
        }
        setTimeout(() => resolve(result), 100)
      })
    },
  }
}

/*
  function getGapTimesForTest1(): DateTime[] {
    return [DateTime.utc(2021, 6, 11), DateTime.utc(2021, 6, 12)]
  }
*/

function getGapTimesForTest2(): DateTime[] {
  return [
    DateTime.utc(2021, 5, 28),
    DateTime.utc(2021, 5, 29),
    DateTime.utc(2021, 5, 30),
    DateTime.utc(2021, 5, 31),
    DateTime.utc(2021, 6, 1),
    // -----------------------
    DateTime.utc(2021, 6, 7),
    DateTime.utc(2021, 6, 8),
    DateTime.utc(2021, 6, 9),
    DateTime.utc(2021, 6, 10),
    DateTime.utc(2021, 6, 11),
    DateTime.utc(2021, 6, 12),
    DateTime.utc(2021, 6, 13),
  ]
}
