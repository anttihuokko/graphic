export class Range {
  static readonly EMPTY = new Range(0, 0)

  readonly start: number

  readonly end: number

  static forValues(values: number[]): Range {
    if (!values.length) {
      return Range.EMPTY
    }
    return new Range(Math.min(...values), Math.max(...values))
  }

  static max(ranges: Range[]): Range {
    if (!ranges.length) {
      return Range.EMPTY
    }
    return new Range(Math.min(...ranges.map((range) => range.start)), Math.max(...ranges.map((range) => range.end)))
  }

  constructor(v1: number, v2: number | null = null) {
    if (v2) {
      this.start = Math.min(v1, v2)
      this.end = Math.max(v1, v2)
    } else {
      this.start = Math.min(0, v1)
      this.end = Math.max(0, v1)
    }
  }

  get size(): number {
    return this.end - this.start
  }

  get middle(): number {
    return this.start + this.size / 2
  }

  isEmpty(): boolean {
    return this.start === this.end
  }

  contains(value: number): boolean {
    return !(value < this.start) && !(value > this.end)
  }

  isSame(other: Range): boolean {
    return this.start === other.start && this.end === other.end
  }

  isBefore(other: Range): boolean {
    return this.end < other.start
  }

  isAfter(other: Range): boolean {
    return other.end < this.start
  }

  encloses(other: Range): boolean {
    return this.contains(other.start) && this.contains(other.end)
  }

  intersectsWith(other: Range): boolean {
    return (
      this.contains(other.start) || this.contains(other.end) || other.contains(this.start) || other.contains(this.end)
    )
  }

  growStart(amount: number): Range {
    return new Range(this.start - amount, this.end)
  }

  growEnd(amount: number): Range {
    return new Range(this.start, this.end + amount)
  }

  grow(amount: number): Range {
    return new Range(this.start - amount, this.end + amount)
  }

  intersection(other: Range): Range {
    if (!this.intersectsWith(other)) {
      return Range.EMPTY
    }
    return new Range(Math.max(this.start, other.start), Math.min(this.end, other.end))
  }

  toString(): string {
    return `${this.start} - ${this.end}`
  }
}
