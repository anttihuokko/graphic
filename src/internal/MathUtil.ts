import { ScreenLocation } from '../model/ScreenLocation'

export class MathUtil {
  static roundBy(value: number, targetMultiplier: number): number {
    return Math.round(value / targetMultiplier) * targetMultiplier
  }

  static getDecimalCount(value: number): number {
    const str = value.toString()
    const index = str.indexOf('.')
    return index >= 0 ? str.length - index - 1 : 0
  }

  static chunk(value: number, chunkSize: number): number[] {
    const result: number[] = []
    let reminder = Math.abs(value)
    while (reminder > chunkSize) {
      reminder -= chunkSize
      result.push(chunkSize)
    }
    if (reminder !== 0) {
      result.push(reminder)
    }
    return value > 0 ? result : result.map((v) => -v)
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }

  static distance(l1: ScreenLocation, l2: ScreenLocation): number {
    return Math.sqrt(Math.pow(l1.x - l2.x, 2) + Math.pow(l1.y - l2.y, 2))
  }

  static middle(l1: ScreenLocation, l2: ScreenLocation): ScreenLocation {
    return new ScreenLocation((l1.x + l2.x) / 2, (l1.y + l2.y) / 2)
  }

  static round(value: number, precision: number = 0): number {
    if (precision <= 0) {
      return Math.round(value)
    }
    const multiplier = 10 ** precision
    return Math.round(value * multiplier) / multiplier
  }
}
