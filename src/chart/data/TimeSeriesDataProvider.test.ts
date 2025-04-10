import { TimeSeriesItem, TimeSeriesSection } from './TimeSeries'
import { TimeSeriesDataProvider } from './TimeSeriesDataProvider'
import { TimeSeriesDataQuery } from './TimeSeriesDataQuery'
import { TimeSeriesDataLoadFn, TimeSeriesDataSource } from './TimeSeriesDataSource'
import { Time, Duration } from '../../model/Time'

type DataType = { time: string; value: number }

function loadTimeSeriesDataDefault(time: Time, beforeCount: number, afterCount: number): Promise<DataType[]> {
  const result: DataType[] = []
  const endTime = time.toDateTime().plus({ days: afterCount })
  let currentTime = time.toDateTime().minus({ days: beforeCount })
  let value = currentTime.day
  while (currentTime <= endTime) {
    result.push({
      time: currentTime.toISO() ?? '',
      value: value++,
    })
    currentTime = currentTime.plus({ days: 1 })
  }
  return Promise.resolve(result)
}

function createTimeSeriesDataSource(load: TimeSeriesDataLoadFn): TimeSeriesDataSource {
  return {
    timeField: 'time',
    load: load,
  }
}

function createQuery(time: Time, beforeCount: number, afterCount: number): TimeSeriesDataQuery {
  return new TimeSeriesDataQuery(Duration.forDays(1), new TimeSeriesSection(time, beforeCount, afterCount))
}

async function loadData(
  time: Time,
  beforeCount: number,
  afterCount: number,
  dataProvider: TimeSeriesDataProvider,
  forceReset: boolean = false
): Promise<TimeSeriesItem[]> {
  const ts = await dataProvider.loadData(createQuery(time, beforeCount, afterCount), forceReset)
  if (!ts) {
    throw Error('No cache data found')
  }
  return ts.getItems()
}

function loadTimeSeriesDataError(_time: Time, _beforeCount: number, _afterCount: number): Promise<DataType[]> {
  return Promise.reject()
}

function loadTimeSeriesDataDelayed(time: Time, beforeCount: number, afterCount: number): Promise<DataType[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      loadTimeSeriesDataDefault(time, beforeCount, afterCount).then((items) => resolve(items))
    }, 500)
  })
}

test('should load data is cache is empty', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')

  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(1)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 12), 10, 10, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(1)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 12))
  expect(requestFinishedMock).toBeCalledTimes(1)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 12))

  await loadData(Time.utc(2021, 3, 10), 2, 2, dataProvider, true)
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 10), 10, 10, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(2)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 10))
  expect(requestFinishedMock).toBeCalledTimes(2)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 10))
})

test('should load data only if data not cached', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)

  await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(1)
  expect(requestStartedMock).toBeCalledTimes(1)
  expect(requestFinishedMock).toBeCalledTimes(1)

  await loadData(Time.utc(2021, 3, 6), 4, 4, dataProvider)
  expect(loadMock).toBeCalledTimes(1)
  expect(requestStartedMock).toBeCalledTimes(1)
  expect(requestFinishedMock).toBeCalledTimes(1)

  await loadData(Time.utc(2021, 3, 22), 0, 0, dataProvider)
  expect(loadMock).toBeCalledTimes(1)
  expect(requestStartedMock).toBeCalledTimes(1)
  expect(requestFinishedMock).toBeCalledTimes(1)

  await loadData(Time.utc(2021, 3, 3), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 2), 10, 0, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(2)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 2))
  expect(requestFinishedMock).toBeCalledTimes(2)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 2))

  await loadData(Time.utc(2021, 2, 25), 3, 4, dataProvider)
  expect(loadMock).toBeCalledTimes(2)
  expect(requestStartedMock).toBeCalledTimes(2)
  expect(requestFinishedMock).toBeCalledTimes(2)
})

test('should load data to start of cached interval', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)

  await loadData(Time.utc(2021, 3, 3), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 2), 10, 0, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(2)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 2))
  expect(requestFinishedMock).toBeCalledTimes(2)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 2))
})

test('should load data to end of cached interval', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)

  await loadData(Time.utc(2021, 3, 21), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 22), 0, 10, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(2)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 22))
  expect(requestFinishedMock).toBeCalledTimes(2)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 22))
})

test('should load data to start and end of cached interval', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)

  await loadData(Time.utc(2021, 3, 20), 20, 20, dataProvider)
  expect(loadMock).toBeCalledTimes(3)
  expect(loadMock).toHaveBeenNthCalledWith(2, Time.utc(2021, 3, 2), 100, 0, expect.any(String))
  expect(loadMock).toHaveBeenNthCalledWith(3, Time.utc(2021, 3, 22), 0, 100, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(3)
  expect(requestStartedMock).toHaveBeenNthCalledWith(2, expect.any(String), Time.utc(2021, 3, 2))
  expect(requestStartedMock).toHaveBeenNthCalledWith(3, expect.any(String), Time.utc(2021, 3, 22))
  expect(requestFinishedMock).toBeCalledTimes(3)
  expect(requestFinishedMock).toHaveBeenNthCalledWith(2, expect.any(String), Time.utc(2021, 3, 2))
  expect(requestFinishedMock).toHaveBeenNthCalledWith(3, expect.any(String), Time.utc(2021, 3, 22))
})

test('should reset cached data if requested data is not continuous', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 3, 15), 5, 5, dataProvider)

  await loadData(Time.utc(2021, 2, 1), 5, 5, dataProvider)
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 2, 1), 25, 25, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(2)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 2, 1))
  expect(requestFinishedMock).toBeCalledTimes(2)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 2, 1))

  await loadData(Time.utc(2021, 2, 28), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(3)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 2, 28), 10, 10, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(3)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 2, 28))
  expect(requestFinishedMock).toBeCalledTimes(3)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 2, 28))
})

test('should clean cached data if cached data too large', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await loadData(Time.utc(2021, 1, 1), 60, 60, dataProvider)
  expect(loadMock).toBeCalledTimes(1)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 1, 1), 300, 300, expect.any(String))

  await loadData(Time.utc(2021, 10, 28), 2, 2, dataProvider)
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 10, 28), 0, 10, expect.any(String))

  await loadData(Time.utc(2021, 1, 1), 10, 10, dataProvider)
  expect(loadMock).toBeCalledTimes(3)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 1, 1), 50, 50, expect.any(String))
})

test('should call requestStarted and requestFinished callbacks on load error', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataError).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  try {
    await dataProvider.loadData(createQuery(Time.utc(2021, 3, 5), 5, 5))
    fail('Should throw expection')
  } catch {
    // Ignore
  }
  expect(loadMock).toBeCalledTimes(1)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 5), 25, 25, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(1)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 5))
  expect(requestFinishedMock).toBeCalledTimes(1)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 5))
})

test('should have only single active request', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDelayed).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await Promise.all([
    loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
    loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
    loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
  ])
  expect(loadMock).toBeCalledTimes(1)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 12), 10, 10, expect.any(String))
  expect(requestStartedMock).toBeCalledTimes(1)
  expect(requestStartedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 12))
  expect(requestFinishedMock).toBeCalledTimes(1)
  expect(requestFinishedMock).toHaveBeenLastCalledWith(expect.any(String), Time.utc(2021, 3, 12))
})

test('should have empty cache after request timeout', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDelayed).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock,
    300
  )

  try {
    await loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider)
    fail('Should throw expection')
  } catch {
    // Ignore
  }
  expect(dataProvider.getDataFromCache(createQuery(Time.utc(2021, 3, 12), 2, 2))).toBe(null)
})

test('should execute next request after timeout', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDelayed).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock,
    300
  )

  try {
    await Promise.allSettled([
      loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
      loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
      loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
      loadData(Time.utc(2021, 3, 12), 2, 2, dataProvider),
    ])
    fail('Should throw expection')
  } catch {
    // Ignore
  }
  expect(loadMock).toBeCalledTimes(4)
  expect(requestStartedMock).toBeCalledTimes(4)
  expect(requestFinishedMock).toBeCalledTimes(4)
})

test('should return data in request order', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDelayed).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  const result = await Promise.race([
    loadData(Time.utc(2021, 1, 5), 4, 4, dataProvider),
    loadData(Time.utc(2021, 1, 4), 2, 2, dataProvider),
    loadData(Time.utc(2021, 1, 3), 5, 5, dataProvider),
  ])
  expect(result[0].getNumberValue('value')).toBe(32)
})

test('should reset data if cache has incorrect time unit duration', async () => {
  const loadMock = jest.fn(loadTimeSeriesDataDefault).mockName('loadMock')
  const requestStartedMock = jest.fn().mockName('requestStartedMock')
  const requestFinishedMock = jest.fn().mockName('requestFinishedMock')
  const dataProvider = new TimeSeriesDataProvider(
    createTimeSeriesDataSource(loadMock),
    requestStartedMock,
    requestFinishedMock
  )

  await dataProvider.loadData(createQuery(Time.utc(2021, 3, 5), 5, 5))
  expect(loadMock).toBeCalledTimes(1)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 5), 25, 25, expect.any(String))

  await dataProvider.loadData(
    new TimeSeriesDataQuery(Duration.forHours(1), new TimeSeriesSection(Time.utc(2021, 3, 5), 5, 5))
  )
  expect(loadMock).toBeCalledTimes(2)
  expect(loadMock).toHaveBeenLastCalledWith(Time.utc(2021, 3, 5), 25, 25, expect.any(String))
})
