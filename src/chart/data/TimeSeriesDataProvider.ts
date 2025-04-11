import { pull } from 'lodash'
import { TimeSeriesItemSlice } from './TimeSeries'
import { TimeSeriesDataCache } from './TimeSeriesDataCache'
import { TimeSeriesDataQuery } from './TimeSeriesDataQuery'
import { TimeSeriesDataSource } from './TimeSeriesDataSource'
import { TimeSeriesDataRequest } from './TimeSeriesDataRequest'
import { Time } from '../../model/Time'
import { Interval } from '../../model/Interval'

export class TimeSeriesDataProvider {
  private readonly cache = new TimeSeriesDataCache()

  private activeQuery: TimeSeriesDataQuery | null = null

  private closed: boolean = false

  private readonly activeRequests: TimeSeriesDataRequest[] = []

  constructor(
    private readonly dataSource: TimeSeriesDataSource,
    private readonly requestStarted: (requestId: string, time: Time) => void = () => undefined,
    private readonly requestFinished: (requestId: string, time: Time) => void = () => undefined,
    private readonly requestTimeout = 30000
  ) {}

  getCachedInterval(): Interval {
    return this.cache.getCachedInterval()
  }

  getDataFromCache(query: TimeSeriesDataQuery): TimeSeriesItemSlice | null {
    return this.cache.getData(query)
  }

  async loadData(query: TimeSeriesDataQuery, forceReset: boolean = false): Promise<TimeSeriesItemSlice | null> {
    while (!this.closed && this.activeQuery) {
      await this.activeQuery.wait()
    }
    if (this.closed) {
      return null
    }
    this.activeQuery = query
    try {
      if (forceReset || !this.cache.hasMatchingTimeUnitDuration(query)) {
        this.cache.reset(query.timeUnitDuration)
      }
      if (forceReset || !this.cache.hasFullData(query)) {
        await this.fetchDataToCache(query)
      }
      return this.getDataFromCache(query)
    } finally {
      this.activeQuery?.close()
      this.activeQuery = null
    }
  }

  closeProvider() {
    this.closed = true
    this.activeQuery?.close()
    this.activeQuery = null
    this.activeRequests.length = 0
  }

  private async fetchDataToCache(query: TimeSeriesDataQuery): Promise<PromiseSettledResult<void>[]> {
    const requests = this.cache.createRequests(query, 4)
    if (!requests.length) {
      return []
    }
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        this.handleRequestStart(query.id, request)
        try {
          await this.handleRequestExecute(query.id, request)
        } finally {
          this.handleRequestFinish(query.id, request)
        }
      })
    )
    this.cache.clearOutside(query, 12)
    const errors = results.flatMap((result) => (result.status === 'rejected' ? [result.reason as unknown] : []))
    if (errors.length) {
      throw Error(`Error loading chart data: ${errors.join(', ')}`)
    }
    return results
  }

  private handleRequestStart(queryId: string, request: TimeSeriesDataRequest): void {
    if (this.isActiveQuery(queryId)) {
      this.activeRequests.push(request)
      setTimeout(() => this.handleRequestFinish(queryId, request), this.requestTimeout)
      this.requestStarted(request.id, request.section.time)
    }
  }

  private async handleRequestExecute(queryId: string, request: TimeSeriesDataRequest): Promise<void> {
    if (this.isActiveQuery(queryId) && this.isActiveRequest(request.id)) {
      const items = await request.loadData(this.dataSource)
      if (this.isActiveQuery(queryId) && this.isActiveRequest(request.id)) {
        this.cache.storeData(request, items)
      }
    }
  }

  private handleRequestFinish(queryId: string, request: TimeSeriesDataRequest): void {
    if (this.isActiveQuery(queryId)) {
      const activeRequest = this.getActiveRequest(request.id)
      if (activeRequest) {
        pull(this.activeRequests, activeRequest)
        this.requestFinished(request.id, request.section.time)
      }
    }
  }

  private isActiveQuery(queryId: string): boolean {
    return queryId === this.activeQuery?.id
  }

  private isActiveRequest(requestId: string): boolean {
    return !!this.getActiveRequest(requestId)
  }

  private getActiveRequest(requestId: string): TimeSeriesDataRequest | undefined {
    return this.activeRequests.find((request) => request.id === requestId)
  }
}
