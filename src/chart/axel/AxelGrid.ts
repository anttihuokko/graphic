import { MathUtil } from '../../internal/MathUtil'
import { Range } from '../../model/Range'
import { Context } from '../Context'
import { ValueFormatter } from './Axel'
import { GapCalculator } from './GapCalculator'
import { ZoomManager } from './ZoomManager'

export interface GridLineDefinition {
  value: number
  position: number
  label: string
}

export interface ConversionResult {
  resultWithoutOffset: number
  resultWithOffset: number
}

export class AxelGrid<ZM extends ZoomManager> {
  private startValue = 0

  private gapCalculator = new GapCalculator([])

  constructor(
    readonly horizontal: boolean,
    readonly inverted: boolean,
    private readonly offsetUnits: number,
    readonly zoomManager: ZM,
    private readonly context: Context
  ) {}

  get gridStartValue() {
    return this.startValue
  }

  isOffsetOverInterval(pixels: number): boolean {
    return Math.abs(pixels / this.getIntervalPixels()) > 1.0
  }

  getOffsetSize(): number {
    return this.offsetUnits * this.zoomManager.getGridUnitSize()
  }

  getTotalSize(): number {
    return this.zoomManager.toValue(this.getTotalPixels())
  }

  getStartValue(): number {
    return this.startValue + this.gapCalculator.getGapAmount(this.startValue, true, true)
  }

  getMiddleValue(): number {
    const value = this.startValue + this.getTotalSize() / 2
    return value + this.gapCalculator.getGapAmount(value, true, true)
  }

  getEndValue(): number {
    const value = this.startValue + this.getTotalSize()
    return value + this.gapCalculator.getGapAmount(value, true, true)
  }

  getGridLineDefinitions(valueFormatter: ValueFormatter): GridLineDefinition[] {
    const result: GridLineDefinition[] = []
    const leftBufferCount = (this.offsetUnits > 0 ? Math.ceil(this.offsetUnits) : 0) + 1
    const rightBufferCount = (this.offsetUnits < 0 ? Math.ceil(-this.offsetUnits) : 0) + 1
    const valueOffset = this.zoomManager.getGridUnitSize() * this.offsetUnits
    const pixelOffset = this.zoomManager.getGridUnitPixels() * this.offsetUnits
    const requiredCount =
      Math.ceil(this.getTotalPixels() / this.getIntervalPixels()) + leftBufferCount + rightBufferCount
    let previousValue: number | null = null
    let currentValue = MathUtil.roundBy(
      this.startValue - this.getIntervalSize() * leftBufferCount,
      this.getIntervalSize()
    )
    currentValue = currentValue + this.gapCalculator.getGapAmount(currentValue, true, true)
    while (result.length < requiredCount) {
      if (previousValue !== null) {
        currentValue =
          currentValue +
          this.gapCalculator.getGapAmountBetween(previousValue + valueOffset, currentValue + valueOffset, true, true)
      }
      const positionOffset = result.length - leftBufferCount
      result.push({
        value: currentValue + valueOffset,
        position: this.inverted
          ? this.getTotalPixels() - positionOffset * this.getIntervalPixels() + pixelOffset
          : positionOffset * this.getIntervalPixels() + pixelOffset,
        label: valueFormatter.format(currentValue, false),
      })
      previousValue = currentValue
      currentValue = currentValue + this.getIntervalSize()
    }
    return result
  }

  convertValueToPixel(value: number): number {
    const offset = this.zoomManager.toPixel(
      value + this.getOffsetSize() - this.gapCalculator.getGapAmount(value, false, true) - this.startValue
    )
    return this.inverted ? this.getTotalPixels() - offset : offset
  }

  convertPixelToValue(pixels: number, snap: boolean): ConversionResult {
    const offset = this.zoomManager.toValue(pixels)
    const value = this.inverted ? this.getTotalSize() + this.startValue - offset : this.startValue + offset
    const gapAmount = this.gapCalculator.getGapAmount(value, true, true)
    const valueWithOffset = value + gapAmount
    const valueWithoutOffset = this.inverted
      ? valueWithOffset + this.getOffsetSize()
      : valueWithOffset - this.getOffsetSize()
    return {
      resultWithoutOffset: snap ? this.roundByGridUnit(valueWithoutOffset) : valueWithoutOffset,
      resultWithOffset: snap ? this.roundByGridUnit(valueWithOffset) : valueWithOffset,
    }
  }

  setGaps(gaps: Range[]) {
    this.gapCalculator = new GapCalculator(gaps)
  }

  updateOffset(pixels: number): void {
    this.startValue += this.zoomManager.toValue(this.inverted ? pixels : -pixels)
  }

  updateZoom(amount: number): boolean {
    return this.zoomManager.updateZoom(MathUtil.clamp(amount, -5, 5))
  }

  moveToValue(value: number, transformValue: boolean): number {
    if (transformValue) {
      const snappedValue = this.gapCalculator.snap(value)
      this.startValue = snappedValue - this.gapCalculator.getGapAmount(snappedValue, false, true)
    } else {
      this.startValue = value
    }
    const valueMod =
      this.startValue < 0
        ? this.getIntervalSize() + (this.startValue % this.getIntervalSize())
        : this.startValue % this.getIntervalSize()
    let valueOffset
    if (valueMod < this.getIntervalSize() / 2) {
      valueOffset = -valueMod
    } else {
      valueOffset = this.getIntervalSize() - valueMod
    }
    return this.zoomManager.toPixel(valueOffset)
  }

  private getIntervalSize(): number {
    return this.zoomManager.getGridIntervalSize()
  }

  private getIntervalPixels(): number {
    return this.zoomManager.getGridIntervalPixels()
  }

  private getTotalPixels(): number {
    return this.horizontal ? this.context.dimensions.drawAreaWidth : this.context.dimensions.drawAreaHeight
  }

  private roundByGridUnit(value: number): number {
    return MathUtil.roundBy(value, this.zoomManager.getGridUnitSize())
  }
}
