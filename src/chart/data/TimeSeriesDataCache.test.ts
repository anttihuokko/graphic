import { TimeSeriesDataCache } from './TimeSeriesDataCache'
import { TimeSeriesDataQuery } from './TimeSeriesDataQuery'
import { TimeSeriesDataRequest, TimeSeriesDataRequestType } from './TimeSeriesDataRequest'
import { TimeSeriesDataSource } from './TimeSeriesDataSource'
import { TimeSeriesSection } from './TimeSeries'
import { Time, Duration } from '../../model/Time'
import { Interval } from '../../model/Interval'

type DataType = { time: string; value: number }

function createTimeSeriesDataSource(): TimeSeriesDataSource {
  return {
    timeField: 'time',
    load: (time, beforeCount, afterCount) => {
      const result: DataType[] = []
      for (let i = 0; i <= beforeCount + afterCount; i++) {
        result.push({
          time:
            time
              .toDateTime()
              .minus({ days: beforeCount - i })
              .toISO() ?? '',
          value: i,
        })
      }
      return Promise.resolve(result)
    },
  }
}

function createQuery1H(time: Time, beforeCount: number, afterCount: number): TimeSeriesDataQuery {
  return createQuery(Duration.forHours(1), time, beforeCount, afterCount)
}

function createQuery1D(time: Time, beforeCount: number, afterCount: number): TimeSeriesDataQuery {
  return createQuery(Duration.forDays(1), time, beforeCount, afterCount)
}

function createQuery(
  timeUnitDuration: Duration,
  time: Time,
  beforeCount: number,
  afterCount: number
): TimeSeriesDataQuery {
  return new TimeSeriesDataQuery(timeUnitDuration, new TimeSeriesSection(time, beforeCount, afterCount))
}

async function storeLeftExpandData(cache: TimeSeriesDataCache, time: Time, count: number): Promise<void> {
  await storeData(cache, TimeSeriesDataRequest.createLeftExpandRequest(time, count))
}

async function storeRigthExpandData(cache: TimeSeriesDataCache, time: Time, count: number): Promise<void> {
  await storeData(cache, TimeSeriesDataRequest.createRigthExpandRequest(time, count))
}

async function storeResetData(
  cache: TimeSeriesDataCache,
  time: Time,
  beforeCount: number,
  afterCount: number
): Promise<void> {
  await storeData(cache, TimeSeriesDataRequest.createResetRequest(time, beforeCount, afterCount))
}

async function storeData(cache: TimeSeriesDataCache, request: TimeSeriesDataRequest): Promise<void> {
  cache.storeData(request, await request.loadData(createTimeSeriesDataSource()))
}

function assertCacheData(cache: TimeSeriesDataCache, query: TimeSeriesDataQuery, expectedItemTimes: Time[]): void {
  expect(cache.hasFullData(query)).toBe(true)
  const ts = cache.getData(query)
  if (!ts) {
    throw Error('No cache data found')
  }
  expect(ts.getItems().map((item) => item.time)).toStrictEqual(expectedItemTimes)
}

function assertRequest(
  request: TimeSeriesDataRequest,
  expectedType: TimeSeriesDataRequestType,
  expectedTime: Time,
  expectedBeforeCount: number,
  expectedAfterCount: number
): void {
  expect(request.type).toBe(expectedType)
  expect(request.section.time).toStrictEqual(expectedTime)
  expect(request.section.beforeCount).toBe(expectedBeforeCount)
  expect(request.section.afterCount).toBe(expectedAfterCount)
}

function assertCachedInterval(cache: TimeSeriesDataCache, startTime: Time, endTime: Time) {
  expect(cache.getCachedInterval()).toStrictEqual(new Interval(startTime, endTime))
}

test('should return true if has full data for the query', async () => {
  const cache = new TimeSeriesDataCache()
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 5, 5))).toBe(false)
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 4, 4))).toBe(true)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 4, 5))).toBe(true)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 5, 4))).toBe(true)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 5, 5))).toBe(true)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 6, 5))).toBe(false)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 5, 6))).toBe(false)
  expect(cache.hasFullData(createQuery1H(Time.utc(2021, 3, 10), 4, 4))).toBe(false)
  expect(cache.hasFullData(createQuery1H(Time.utc(2021, 3, 10), 6, 5))).toBe(false)
})

test('should get data matching the query', async () => {
  const cache = new TimeSeriesDataCache()
  expect(cache.getData(createQuery1D(Time.utc(2021, 3, 10), 5, 5))).toBe(null)
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  assertCacheData(cache, createQuery1D(Time.utc(2021, 3, 10), 5, 5), [
    Time.utc(2021, 3, 5),
    Time.utc(2021, 3, 6),
    Time.utc(2021, 3, 7),
    Time.utc(2021, 3, 8),
    Time.utc(2021, 3, 9),
    Time.utc(2021, 3, 10),
    Time.utc(2021, 3, 11),
    Time.utc(2021, 3, 12),
    Time.utc(2021, 3, 13),
    Time.utc(2021, 3, 14),
    Time.utc(2021, 3, 15),
  ])
  assertCacheData(cache, createQuery1D(Time.utc(2021, 3, 10), 1, 1), [
    Time.utc(2021, 3, 9),
    Time.utc(2021, 3, 10),
    Time.utc(2021, 3, 11),
  ])
  expect(cache.getData(createQuery1H(Time.utc(2021, 3, 10), 5, 5))).toBe(null)
  expect(cache.getData(createQuery1H(Time.utc(2022, 3, 10), 5, 5))).toBe(null)
})

test('should not create any requests if not needed', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  expect(cache.createRequests(createQuery1D(Time.utc(2021, 3, 10), 4, 4), 2).length).toBe(0)
  expect(cache.createRequests(createQuery1D(Time.utc(2021, 3, 10), 4, 5), 2).length).toBe(0)
  expect(cache.createRequests(createQuery1D(Time.utc(2021, 3, 10), 5, 4), 2).length).toBe(0)
  expect(cache.createRequests(createQuery1D(Time.utc(2021, 3, 10), 5, 5), 2).length).toBe(0)
  expect(cache.createRequests(createQuery1H(Time.utc(2022, 3, 10), 5, 5), 2).length).toBe(0)
})

test('should create reset request if cache is empty', async () => {
  const cache = new TimeSeriesDataCache()
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 3, 10), 5, 5), 2)
  expect(requests.length).toBe(1)
  assertRequest(requests[0], TimeSeriesDataRequestType.RESET, Time.utc(2021, 3, 10), 15, 15)
})

test('should create reset request if not expandable', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 4, 10), 5, 5), 2)
  expect(requests.length).toBe(1)
  assertRequest(requests[0], TimeSeriesDataRequestType.RESET, Time.utc(2021, 4, 10), 15, 15)
})

test('should create left expand request if expandable to beginning', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 3, 5), 5, 5), 2)
  expect(requests.length).toBe(1)
  assertRequest(requests[0], TimeSeriesDataRequestType.LEFT_EXPAND, Time.utc(2021, 3, 5), 15, 0)
})

test('should create left expand request if expandable to middle', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 3, 7), 5, 5), 2)
  expect(requests.length).toBe(1)
  assertRequest(requests[0], TimeSeriesDataRequestType.LEFT_EXPAND, Time.utc(2021, 3, 5), 15, 0)
})

test('should create rigth expand request if expandable to end', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 3, 15), 5, 5), 2)
  expect(requests.length).toBe(1)
  assertRequest(requests[0], TimeSeriesDataRequestType.RIGTH_EXPAND, Time.utc(2021, 3, 15), 0, 15)
})

test('should create rigth expand request if expandable to middle', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 3, 13), 5, 5), 2)
  expect(requests.length).toBe(1)
  assertRequest(requests[0], TimeSeriesDataRequestType.RIGTH_EXPAND, Time.utc(2021, 3, 15), 0, 15)
})

test('should create left and rigth expand requests', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  const requests = cache.createRequests(createQuery1D(Time.utc(2021, 3, 7), 10, 10), 2)
  expect(requests.length).toBe(2)
  assertRequest(requests[0], TimeSeriesDataRequestType.LEFT_EXPAND, Time.utc(2021, 3, 5), 30, 0)
  assertRequest(requests[1], TimeSeriesDataRequestType.RIGTH_EXPAND, Time.utc(2021, 3, 15), 0, 30)
})

test('should store reset request data to cache', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  assertCachedInterval(cache, Time.utc(2021, 3, 5), Time.utc(2021, 3, 15))
  await storeResetData(cache, Time.utc(2021, 3, 10), 2, 3)
  assertCachedInterval(cache, Time.utc(2021, 3, 8), Time.utc(2021, 3, 13))
})

test('should store expand request data to cache', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  await storeLeftExpandData(cache, Time.utc(2021, 3, 5), 3)
  await storeRigthExpandData(cache, Time.utc(2021, 3, 14), 3)
  assertCachedInterval(cache, Time.utc(2021, 3, 2), Time.utc(2021, 3, 17))
})

test('should not store expand request data to cache if not expandable', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  await storeLeftExpandData(cache, Time.utc(2021, 3, 4), 3)
  await storeRigthExpandData(cache, Time.utc(2021, 3, 16), 3)
  assertCachedInterval(cache, Time.utc(2021, 3, 5), Time.utc(2021, 3, 15))
})

test('should clear outside cache items', async () => {
  const cache = new TimeSeriesDataCache()

  await storeResetData(cache, Time.utc(2021, 6, 1), 100, 100)
  assertCachedInterval(cache, Time.utc(2021, 2, 21), Time.utc(2021, 9, 9))
  cache.clearOutside(createQuery1D(Time.utc(2021, 6, 1), 5, 5), 5)
  assertCachedInterval(cache, Time.utc(2021, 5, 7), Time.utc(2021, 6, 26))

  await storeResetData(cache, Time.utc(2021, 6, 1), 100, 100)
  assertCachedInterval(cache, Time.utc(2021, 2, 21), Time.utc(2021, 9, 9))
  cache.clearOutside(createQuery1D(Time.utc(2021, 2, 21), 5, 5), 5)
  assertCachedInterval(cache, Time.utc(2021, 2, 21), Time.utc(2021, 3, 18))

  await storeResetData(cache, Time.utc(2021, 6, 1), 100, 100)
  assertCachedInterval(cache, Time.utc(2021, 2, 21), Time.utc(2021, 9, 9))
  cache.clearOutside(createQuery1D(Time.utc(2021, 9, 9), 5, 5), 5)
  assertCachedInterval(cache, Time.utc(2021, 8, 15), Time.utc(2021, 9, 9))
})

test('should clear all cache data after reset', async () => {
  const cache = new TimeSeriesDataCache()
  await storeResetData(cache, Time.utc(2021, 3, 10), 5, 5)
  assertCachedInterval(cache, Time.utc(2021, 3, 5), Time.utc(2021, 3, 15))
  cache.reset(Duration.forDays(1))
  expect(cache.getCachedInterval()).toStrictEqual(Interval.EMPTY)
  expect(cache.hasFullData(createQuery1D(Time.utc(2021, 3, 10), 5, 5))).toBe(false)
})
