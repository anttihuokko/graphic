import { Range } from '../../model/Range'
import { Time, Duration } from '../../model/Time'

export class GapCalculator {
  constructor(private readonly gaps: Range[]) {}

  snap(value: number): number {
    const gap = this.getGapAt(value)
    return gap ? gap.end : value
  }

  getGapAmount(value: number, project: boolean, full: boolean): number {
    return this.getGapAmountBetween(Number.MIN_VALUE, value, project, full)
  }

  getGapAmountBetween(v1: number, v2: number, project: boolean, full: boolean): number {
    const defaultLimit = new Range(v1, v2)
    return this.gaps.reduce((acc, gap) => {
      const limit = project ? defaultLimit.growEnd(acc) : defaultLimit
      return acc + this.getGapMagnitude(gap, limit, full)
    }, 0)
  }

  toString(): string {
    return this.gaps.reduce((acc, gap) => {
      return (
        acc +
        `${Time.fromMillis(gap.start).format()} - ${Time.fromMillis(gap.end).format()} -> ${Duration.forMillis(gap.size).format('dd:hh:mm')}\n`
      )
    }, '')
  }

  private getGapAt(value: number): Range | null {
    for (const gap of this.gaps) {
      if (value < gap.start) {
        return null
      }
      if (gap.contains(value)) {
        return gap
      }
    }
    return null
  }

  private getGapMagnitude(gap: Range, limit: Range, full: boolean): number {
    if (gap.intersectsWith(limit)) {
      return full ? gap.size : gap.intersection(limit).size
    }
    return 0
  }
}
