import { TimeSeries, TimeSeriesItem, TimeSeriesItemSlice, TimeSeriesSection } from './TimeSeries'
import { TimeSeriesDataQuery } from './TimeSeriesDataQuery'
import { TimeSeriesDataRequest, TimeSeriesDataRequestType } from './TimeSeriesDataRequest'
import { Interval } from '../../model/Interval'
import { Time, Duration } from '../../model/Time'
import { Util } from '../../internal/Util'

export class TimeSeriesDataCache {
  private timeSeries = TimeSeries.createEmpty(Duration.forDays(1))

  getTimeUnitDuration(): Duration {
    return this.timeSeries.timeUnitDuration
  }

  getCachedInterval(): Interval {
    return this.timeSeries.interval
  }

  hasMatchingTimeUnitDuration(query: TimeSeriesDataQuery): boolean {
    return this.getTimeUnitDuration().toMillis() === query.timeUnitDuration.toMillis()
  }

  hasFullData(query: TimeSeriesDataQuery): boolean {
    if (!this.hasMatchingTimeUnitDuration(query)) {
      return false
    }
    return this.timeSeries.hasFullItemSection(query.section)
  }

  getData(query: TimeSeriesDataQuery): TimeSeriesItemSlice | null {
    if (this.hasMatchingTimeUnitDuration(query)) {
      return this.timeSeries.getItemSlice(query.section)
    }
    return null
  }

  createRequests(query: TimeSeriesDataQuery, expandMultiplier: number): TimeSeriesDataRequest[] {
    const result: TimeSeriesDataRequest[] = []
    if (this.hasMatchingTimeUnitDuration(query) && !this.isOutOfDataRange(query.section.time)) {
      const slice = this.timeSeries.getItemSlice(query.section)
      const requestSection = query.section.expandBy(expandMultiplier + 1)
      if (!slice) {
        result.push(
          TimeSeriesDataRequest.createResetRequest(
            requestSection.time,
            requestSection.beforeCount,
            requestSection.afterCount
          )
        )
      } else if (!slice.hasCompleteItems()) {
        if (slice.isMissingItemsLeft() && !this.timeSeries.containsFullDataStart) {
          result.push(
            TimeSeriesDataRequest.createLeftExpandRequest(this.getCachedInterval().start, requestSection.beforeCount)
          )
        }
        if (slice.isMissingItemsRight() && !this.timeSeries.containsFullDataEnd) {
          result.push(
            TimeSeriesDataRequest.createRigthExpandRequest(this.getCachedInterval().end, requestSection.afterCount)
          )
        }
      }
    }
    return result.filter((request) => !request.isEmpty())
  }

  storeData(request: TimeSeriesDataRequest, items: TimeSeriesItem[]): void {
    if (items.length) {
      if (request.type === TimeSeriesDataRequestType.LEFT_EXPAND) {
        this.handleLeftExpand(request.section, items)
      } else if (request.type === TimeSeriesDataRequestType.RIGTH_EXPAND) {
        this.handleRigthExpand(request.section, items)
      } else if (request.type === TimeSeriesDataRequestType.RESET) {
        this.handleReset(request.section, items)
      } else {
        throw Error(`Unknown request type ${request.type}`)
      }
    }
  }

  clearOutside(query: TimeSeriesDataQuery, expandMultiplier: number): void {
    if (this.hasMatchingTimeUnitDuration(query)) {
      const keepSlice = this.timeSeries.getItemSlice(query.section.expandBy(expandMultiplier))
      if (keepSlice && (!keepSlice.isMissingItemsLeft() || !keepSlice.isMissingItemsRight())) {
        this.timeSeries = TimeSeries.createForSlice(keepSlice)
      }
    }
  }

  reset(timeUnitDuration: Duration): void {
    this.timeSeries = TimeSeries.createEmpty(timeUnitDuration)
  }

  private isOutOfDataRange(time: Time): boolean {
    if (this.timeSeries.containsFullDataStart && time < this.timeSeries.interval.start) {
      return true
    }
    if (this.timeSeries.containsFullDataEnd && time > this.timeSeries.interval.end) {
      return true
    }
    return false
  }

  private handleLeftExpand(requestSection: TimeSeriesSection, items: TimeSeriesItem[]): void {
    const lastItem = Util.last(items)
    const slice = lastItem
      ? this.timeSeries.getItemSlice(new TimeSeriesSection(lastItem.time, 0, Number.MAX_VALUE))
      : null
    if (slice) {
      this.setCachedItems(requestSection, items.concat(slice.getItems().slice(1)))
    } else {
      console.warn(`Failed to expand cache data to left because no connecting item found for time ${lastItem?.time}`)
    }
  }

  private handleRigthExpand(requestSection: TimeSeriesSection, items: TimeSeriesItem[]): void {
    const firstItem = Util.first(items)
    const slice = firstItem
      ? this.timeSeries.getItemSlice(new TimeSeriesSection(firstItem.time, Number.MAX_VALUE, 0))
      : null
    if (slice) {
      this.setCachedItems(requestSection, slice.getItems().slice(0, -1).concat(items))
    } else {
      console.warn(`Failed to expand cache data to right because no connecting item found for time ${firstItem?.time}`)
    }
  }

  private handleReset(requestSection: TimeSeriesSection, items: TimeSeriesItem[]): void {
    this.setCachedItems(requestSection, items)
  }

  private setCachedItems(requestSection: TimeSeriesSection, items: TimeSeriesItem[]) {
    const slice = TimeSeries.create(this.getTimeUnitDuration(), items).getItemSlice(requestSection)
    this.timeSeries = TimeSeries.create(
      this.getTimeUnitDuration(),
      items,
      requestSection.beforeCount > 0 ? !slice || slice.missingItemCountLeft > 1 : this.timeSeries.containsFullDataStart,
      requestSection.afterCount > 0 ? !slice || slice.missingItemCountRight > 1 : this.timeSeries.containsFullDataEnd
    )
  }
}
