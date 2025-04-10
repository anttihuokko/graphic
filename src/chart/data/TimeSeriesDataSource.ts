import { Time } from '../../model/Time'

export type TimeSeriesDataLoadFn = (
  time: Time,
  beforeCount: number,
  afterCount: number,
  requestId: string
) => Promise<unknown[]>

export type TimeSeriesDataSource = { timeField: string; load: TimeSeriesDataLoadFn }
