import { round } from 'lodash'

export class Offset {
  static readonly ZERO = new Offset(0, 0)

  static readonly ONE = new Offset(1, 1)

  constructor(
    readonly x: number,
    readonly y: number
  ) {}

  isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  isSmallerThan(other: Offset) {
    return this.x + this.y < other.x + other.y
  }

  abs(): Offset {
    return new Offset(Math.abs(this.x), Math.abs(this.y))
  }

  multiply(value: number): Offset {
    return new Offset(this.x * value, this.y * value)
  }

  round(precision: number = 0): Offset {
    return new Offset(round(this.x, precision), round(this.y, precision))
  }
}
