import { uniqueId } from 'lodash'
import { TimeSeriesSection } from './TimeSeries'
import { Duration } from '../../model/Time'

export class TimeSeriesDataQuery {
  readonly id: string = uniqueId('QUERY-')

  private readonly promise: Promise<void>

  private promiseResolve: (() => void) | null = null

  constructor(
    readonly timeUnitDuration: Duration,
    readonly section: TimeSeriesSection
  ) {
    this.promise = new Promise((resolve) => (this.promiseResolve = resolve))
  }

  async wait(): Promise<void> {
    await this.promise
  }

  close(): void {
    if (this.promiseResolve) {
      this.promiseResolve()
    }
  }
}
