import { Time, Duration } from './Time'

export class Interval {
  static readonly EMPTY = new Interval(Time.fromMillis(0), Time.fromMillis(0))

  readonly start: Time

  readonly end: Time

  static forMillis(start: number, end: number): Interval {
    return new Interval(Time.fromMillis(start), Time.fromMillis(end))
  }

  static forDuration(start: Time, duration: Duration): Interval {
    return new Interval(start, start.plus(duration))
  }

  static merge(...intervals: Interval[]): Interval {
    return new Interval(Time.min(...intervals.map((i) => i.start)), Time.max(...intervals.map((i) => i.end)))
  }

  constructor(m1: Time, m2: Time) {
    this.start = Time.min(m1, m2)
    this.end = Time.max(m1, m2)
  }

  isEmpty(): boolean {
    return this.start.equals(this.end)
  }

  isSame(other: Interval): boolean {
    return this.start.equals(other.start) && this.end.equals(other.end)
  }

  getMiddleTime(): Time {
    return this.start.plus(Math.round(this.end.diff(this.start).toMillis() / 2))
  }

  getDuration(): Duration {
    return this.end.diff(this.start)
  }

  format(format: string | null = null): string {
    return `${this.start.format(format)} - ${this.end.format(format)}`
  }

  contains(time: Time): boolean {
    return time >= this.start && time <= this.end
  }

  encloses(other: Interval): boolean {
    return this.contains(other.start) && this.contains(other.end)
  }

  intersectsWith(other: Interval): boolean {
    return (
      this.contains(other.start) || this.contains(other.end) || other.contains(this.start) || other.contains(this.end)
    )
  }

  isContinuousWith(other: Interval): boolean {
    return this.contains(other.start) || this.contains(other.end)
  }

  cutStart(time: Time): Interval {
    return new Interval(this.contains(time) ? time : this.start, this.end)
  }

  cutEnd(time: Time): Interval {
    return new Interval(this.start, this.contains(time) ? time : this.end)
  }

  cutBy(other: Interval): Interval {
    return this.cutStart(other.start).cutEnd(other.end)
  }

  intersection(other: Interval): Interval {
    if (!this.intersectsWith(other)) {
      return Interval.EMPTY
    }
    return new Interval(Time.max(this.start, other.start), Time.min(this.end, other.end))
  }

  expandByDuration(duration: Duration): Interval {
    return new Interval(this.start.minus(duration), this.end.plus(duration))
  }

  toString(): string {
    return this.format()
  }
}
