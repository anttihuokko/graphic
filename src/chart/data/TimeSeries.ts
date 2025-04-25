import { MathUtil } from '../../internal/MathUtil'
import { Time, Duration } from '../../model/Time'
import { Interval } from '../../model/Interval'
import { DateTime } from 'luxon'
import { Util } from '../../internal/Util'

export function toTimeSeriesItems(timeField: string, data: unknown[]) {
  return Util.sortBy(
    Util.uniqBy(
      data.map((entry) => new TimeSeriesItem(timeField, entry)),
      (item) => item.timestamp
    ),
    (item) => item.timestamp
  )
}

export class TimeSeriesSection {
  readonly size: number

  constructor(
    readonly time: Time,
    readonly beforeCount: number,
    readonly afterCount: number
  ) {
    this.size = this.beforeCount + this.afterCount + 1
  }

  isEmpty(): boolean {
    return this.beforeCount <= 0 && this.afterCount <= 0
  }

  isSame(other: TimeSeriesSection): boolean {
    return (
      this.time.equals(other.time) && this.beforeCount === other.beforeCount && this.afterCount === other.afterCount
    )
  }

  expandBy(multiplier: number): TimeSeriesSection {
    return new TimeSeriesSection(
      this.time,
      Math.round(this.beforeCount * multiplier),
      Math.round(this.afterCount * multiplier)
    )
  }
}

export class TimeSeriesItemSlice {
  readonly interval: Interval

  constructor(
    readonly missingItemCountLeft: number,
    readonly missingItemCountRight: number,
    readonly containsFullDataStart: boolean,
    readonly containsFullDataEnd: boolean,
    readonly timeUnitDuration: Duration,
    private readonly items: TimeSeriesItem[]
  ) {
    this.interval = items.length ? new Interval(items[0].time, items[items.length - 1].time) : Interval.EMPTY
  }

  isMissingItemsLeft(): boolean {
    return this.missingItemCountLeft > 0
  }

  isMissingItemsRight(): boolean {
    return this.missingItemCountRight > 0
  }

  hasCompleteItems(): boolean {
    return !this.isMissingItemsLeft() && !this.isMissingItemsRight()
  }

  isEmpty(): boolean {
    return this.getItemCount() === 0
  }

  getItemCount(): number {
    return this.items.length
  }

  getItems(): TimeSeriesItem[] {
    return [...this.items]
  }
}

export class TimeSeriesGap {
  constructor(
    readonly startTime: Time,
    readonly endTime: Time
  ) {}
}

export interface DataAccessor {
  readonly time: Time

  getNumberValue(field: string): number
  getNumberValue(field: string, defaultValue: number): number

  getStringValue(field: string): string
  getStringValue(field: string, defaultValue: string): string
}

type DataTypeDefs = {
  NUMBER: {
    type: number
  }
  STRING: {
    type: string
  }
  DATE_TIME: {
    type: DateTime
  }
}

export class TimeSeriesItem implements DataAccessor {
  readonly time: Time

  constructor(
    timeField: string,
    private readonly data: unknown
  ) {
    this.time = this.getTimeValue(timeField)
  }

  get timestamp(): number {
    return this.time.toMillis()
  }

  hasAllValues(fields: string[]): boolean {
    return fields.filter((field) => Util.hasValue(field, this.data)).length === fields.length
  }

  getNumberValue(field: string, defaultValue: number | null = null): number {
    return this.getDataValue(field, 'NUMBER', defaultValue)
  }

  getStringValue(field: string, defaultValue: string | null = null): string {
    return this.getDataValue(field, 'STRING', defaultValue)
  }

  private getTimeValue(field: string): Time {
    return Time.fromDateTime(this.getDataValue(field, 'DATE_TIME'))
  }

  private getDataValue<N extends keyof DataTypeDefs, T extends DataTypeDefs[N]['type']>(
    field: string,
    typeName: N,
    defaultValue: T | null = null
  ): T {
    const value = (Util.getValue(field, this.data) as unknown) ?? defaultValue
    if (value == null) {
      throw Error(`No data value exist for field '${field}' in item ${JSON.stringify(this)}`)
    }
    if (typeof value === 'number') {
      switch (typeName) {
        case 'NUMBER':
          return value as T
        case 'STRING':
          return String(value) as T
        default:
          throw Error(`No conversion from number to ${typeName} for field '${field}' in item ${JSON.stringify(this)}`)
      }
    }
    if (typeof value === 'string') {
      switch (typeName) {
        case 'STRING':
          return value as T
        case 'DATE_TIME':
          return DateTime.fromISO(value, { zone: 'utc' }) as T
        default:
          throw Error(`No conversion from string to ${typeName} for field '${field}' in item ${JSON.stringify(this)}`)
      }
    }
    if (this.isLuxonDateTime(value)) {
      switch (typeName) {
        case 'DATE_TIME':
          return value as T
        case 'STRING':
          return value.toISO() as T
        default:
          throw Error(`No conversion from DateTime to ${typeName} for field '${field}' in item ${JSON.stringify(this)}`)
      }
    }
    throw Error(`Unknown data type for field '${field}' in item ${JSON.stringify(this)}`)
  }

  private isLuxonDateTime(value: unknown): value is DateTime {
    return value !== null && typeof value === 'object' && 'isLuxonDateTime' in value
  }
}

export class TimeSeries {
  static createEmpty(duration: Duration): TimeSeries {
    return TimeSeries.create(duration, [])
  }

  static createForSlice(slice: TimeSeriesItemSlice) {
    return TimeSeries.create(
      slice.timeUnitDuration,
      slice.getItems(),
      slice.containsFullDataStart,
      slice.containsFullDataEnd
    )
  }

  static create(
    duration: Duration,
    items: TimeSeriesItem[],
    containsFullDataStart: boolean = false,
    containsFullDataEnd: boolean = false
  ): TimeSeries {
    return new TimeSeries(containsFullDataStart, containsFullDataEnd, duration, items)
  }

  readonly interval: Interval

  private readonly timeSeriesItems: TimeSeriesItem[]

  private constructor(
    readonly containsFullDataStart: boolean,
    readonly containsFullDataEnd: boolean,
    readonly timeUnitDuration: Duration,
    items: TimeSeriesItem[]
  ) {
    this.interval = items.length > 0 ? new Interval(items[0].time, items[items.length - 1].time) : Interval.EMPTY
    this.timeSeriesItems = [...items]
  }

  isEmpty(): boolean {
    return this.getItemCount() === 0
  }

  getItemCount(): number {
    return this.timeSeriesItems.length
  }

  enclosesInterval(other: Interval): boolean {
    return this.interval.encloses(other)
  }

  hasFullItemSection(section: TimeSeriesSection): boolean {
    const index = this.findClosestItemIndex(section.time)
    if (index > -1) {
      const startIndex = index - section.beforeCount
      const endIndex = index + section.afterCount
      return (
        startIndex >= 0 &&
        startIndex < this.timeSeriesItems.length &&
        endIndex >= 0 &&
        endIndex < this.timeSeriesItems.length
      )
    }
    return false
  }

  getItemSlice(section: TimeSeriesSection): TimeSeriesItemSlice | null {
    const index = this.findClosestItemIndex(section.time)
    if (index > -1) {
      const startIndex = index - section.beforeCount
      const endIndex = index + section.afterCount
      return new TimeSeriesItemSlice(
        startIndex >= 0 ? 0 : -startIndex,
        endIndex < this.getItemCount() ? 0 : endIndex - this.getItemCount() + 1,
        this.containsFullDataStart && startIndex <= 0,
        this.containsFullDataEnd && endIndex >= this.getItemCount() - 1,
        this.timeUnitDuration,
        this.timeSeriesItems.slice(
          MathUtil.clamp(startIndex, 0, this.timeSeriesItems.length - 1),
          MathUtil.clamp(endIndex + 1, 0, this.timeSeriesItems.length)
        )
      )
    }
    return null
  }

  getAllItems(): TimeSeriesItem[] {
    return [...this.timeSeriesItems]
  }

  getGaps(): TimeSeriesGap[] {
    const timeUnitMs = this.timeUnitDuration.toMillis()
    return this.timeSeriesItems.reduce((acc, item, index) => {
      if (index === 0) {
        return acc
      }
      const prevItem = this.timeSeriesItems[index - 1]
      const t1 = prevItem.time.plus(timeUnitMs + 1)
      const t2 = item.time.minus(1)
      return t2 > t1 ? acc.concat([new TimeSeriesGap(prevItem.time.plus(timeUnitMs), item.time)]) : acc
    }, [] as TimeSeriesGap[])
  }

  private findClosestItemIndex(time: Time): number {
    if (!this.interval.contains(time)) {
      return -1
    }
    return this.timeSeriesItems.findIndex((currentItem, index) => {
      if (time.equals(currentItem.time)) {
        return true
      }
      const nextItem = this.timeSeriesItems[index + 1]
      if (!nextItem) {
        return true
      }
      if (time < nextItem.time) {
        const currentItemOffset = Math.abs(currentItem.time.diff(time).toMillis())
        const nextItemOffset = Math.abs(nextItem.time.diff(time).toMillis())
        if (currentItemOffset <= nextItemOffset) {
          return true
        }
      }
      return false
    })
  }
}
