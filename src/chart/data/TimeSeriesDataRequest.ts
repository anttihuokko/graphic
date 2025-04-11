import { uniqueId } from 'lodash'
import { TimeSeriesItem, TimeSeriesSection, toTimeSeriesItems } from './TimeSeries'
import { TimeSeriesDataSource } from './TimeSeriesDataSource'
import { Time } from '../../model/Time'

export enum TimeSeriesDataRequestType {
  LEFT_EXPAND,
  RIGTH_EXPAND,
  RESET,
}

export class TimeSeriesDataRequest {
  static createLeftExpandRequest(time: Time, count: number): TimeSeriesDataRequest {
    return new TimeSeriesDataRequest(TimeSeriesDataRequestType.LEFT_EXPAND, new TimeSeriesSection(time, count, 0))
  }

  static createRigthExpandRequest(time: Time, count: number): TimeSeriesDataRequest {
    return new TimeSeriesDataRequest(TimeSeriesDataRequestType.RIGTH_EXPAND, new TimeSeriesSection(time, 0, count))
  }

  static createResetRequest(time: Time, beforeCount: number, afterCount: number): TimeSeriesDataRequest {
    return new TimeSeriesDataRequest(
      TimeSeriesDataRequestType.RESET,
      new TimeSeriesSection(time, beforeCount, afterCount)
    )
  }

  readonly id: string = uniqueId('REQUEST-')

  private constructor(
    readonly type: TimeSeriesDataRequestType,
    readonly section: TimeSeriesSection
  ) {}

  isEmpty(): boolean {
    return this.section.isEmpty()
  }

  async loadData(dataSource: TimeSeriesDataSource): Promise<TimeSeriesItem[]> {
    return toTimeSeriesItems(
      dataSource.timeField,
      await dataSource.load(this.section.time, this.section.beforeCount, this.section.afterCount, this.id)
    )
  }
}
