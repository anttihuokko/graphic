import { DateTime as LuxonDateTime, Duration as LuxonDuration } from 'luxon'

function getAsMillis(value: number | Duration) {
  return typeof value === 'number' ? value : value.toMillis()
}

const MINUTE_MS = 60000

const HOUR_MS = 3600000

const DAY_MS = 86400000

export type TimeUnit = 'year' | 'month' | 'day' | 'hour' | 'minute'

export class Duration {
  static forMillis(value: number): Duration {
    return new Duration(value)
  }

  static forMinutes(value: number): Duration {
    return Duration.forMillis(value * MINUTE_MS)
  }

  static forHours(value: number): Duration {
    return Duration.forMillis(value * HOUR_MS)
  }

  static forDays(value: number): Duration {
    return Duration.forMillis(value * DAY_MS)
  }

  private constructor(private readonly durationMs: number) {}

  negate(): Duration {
    return new Duration(-this.durationMs)
  }

  plus(value: number | Duration): Duration {
    return new Duration(this.durationMs + getAsMillis(value))
  }

  minus(value: number | Duration): Duration {
    return new Duration(this.durationMs - getAsMillis(value))
  }

  miltiply(value: number): Duration {
    return new Duration(this.durationMs * value)
  }

  divide(value: number): Duration {
    return new Duration(Math.round(this.durationMs / value))
  }

  equals(other: Duration): boolean {
    return this.durationMs === other.durationMs
  }

  valueOf(): number {
    return this.toMillis()
  }

  toMillis(): number {
    return this.durationMs
  }

  toMinutes(): number {
    return this.durationMs / MINUTE_MS
  }

  toHours(): number {
    return this.durationMs / HOUR_MS
  }

  toDays(): number {
    return this.durationMs / DAY_MS
  }

  format(format: string | null = null): string {
    const d = LuxonDuration.fromMillis(this.durationMs)
    return format ? d.toFormat(format) : d.toISO()
  }

  toString(): string {
    return this.format()
  }
}

export class Time {
  static now(): Time {
    return Time.fromDateTime(LuxonDateTime.now())
  }

  static utc(year: number, month: number, day: number = 1, hour: number = 0, minute: number = 0): Time {
    return Time.fromDateTime(LuxonDateTime.utc(year, month, day, hour, minute))
  }

  static fromISO(value: string): Time {
    return Time.fromDateTime(LuxonDateTime.fromISO(value, { zone: 'utc' }))
  }

  static fromDateTime(value: LuxonDateTime): Time {
    return new Time(value.toUTC().toMillis())
  }

  static fromMillis(ms: number): Time {
    return new Time(ms)
  }

  static min(...times: Time[]): Time {
    return times.reduce((acc, time) => {
      return time.toMillis() < acc.toMillis() ? time : acc
    })
  }

  static max(...times: Time[]): Time {
    return times.reduce((acc, time) => {
      return time.toMillis() > acc.toMillis() ? time : acc
    })
  }

  readonly year: number

  readonly month: number

  readonly day: number

  readonly hour: number

  readonly minute: number

  private constructor(private readonly epochMs: number) {
    const time = this.toDateTime()
    this.year = time.year
    this.month = time.month
    this.day = time.day
    this.hour = time.hour
    this.minute = time.minute
  }

  startOf(unit: TimeUnit): Time {
    return new Time(this.toDateTime().startOf(unit).toMillis())
  }

  endOf(unit: TimeUnit): Time {
    return new Time(this.toDateTime().endOf(unit).toMillis())
  }

  plus(value: number | Duration): Time {
    return new Time(this.epochMs + getAsMillis(value))
  }

  minus(value: number | Duration): Time {
    return new Time(this.epochMs - getAsMillis(value))
  }

  diff(other: Time): Duration {
    return Duration.forMillis(this.epochMs - other.epochMs)
  }

  equals(other: Time): boolean {
    return this.epochMs === other.epochMs
  }

  valueOf(): number {
    return this.toMillis()
  }

  toMillis(): number {
    return this.epochMs
  }

  toDateTime(): LuxonDateTime {
    return LuxonDateTime.fromMillis(this.epochMs, { zone: 'utc' })
  }

  format(format: string | null = null): string {
    return format ? this.toDateTime().toFormat(format) : (this.toDateTime().toISO() ?? '???')
  }

  toString(): string {
    return this.format()
  }
}
