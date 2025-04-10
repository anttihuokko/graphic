import { MathUtil } from '../../internal/MathUtil'
import { Range } from '../../model/Range'

export abstract class ZoomManager {
  protected readonly preferredGridIntervalPixels = Math.round(this.gridIntervalPixelRange.middle)

  private gridUnitSize = 100

  private gridUnitPixels = this.preferredGridIntervalPixels

  private gridIntervalGridUnitCount = 1

  private pixelToValueRatio = 1

  constructor(
    private readonly gridIntervalPixelRange: Range,
    private readonly onChange: (
      gridUnitPixels: number,
      gridUnitSize: number,
      gridIntervalGridUnitCount: number
    ) => void = () => undefined
  ) {
    this.refresh()
  }

  getGridUnitSize(): number {
    return this.gridUnitSize
  }

  getGridUnitPixels(): number {
    return this.gridUnitPixels
  }

  getGridIntervalSize(): number {
    return this.gridUnitSize * this.gridIntervalGridUnitCount
  }

  getGridIntervalPixels(): number {
    return this.gridUnitPixels * this.gridIntervalGridUnitCount
  }

  getGridIntervalGridUnitCount() {
    return this.gridIntervalGridUnitCount
  }

  toValue(pixels: number): number {
    return pixels * this.pixelToValueRatio
  }

  toPixel(value: number): number {
    return Math.round(value / this.pixelToValueRatio)
  }

  updateZoom(amount: number): boolean {
    const old = this.gridUnitPixels
    this.gridUnitPixels = MathUtil.clamp(this.gridUnitPixels - amount, 7, this.gridIntervalPixelRange.end)
    if (this.gridUnitPixels !== old) {
      this.gridIntervalGridUnitCount = MathUtil.clamp(
        Math.floor(this.preferredGridIntervalPixels / this.gridUnitPixels),
        1,
        100
      )
      this.refresh()
      return true
    }
    return false
  }

  protected setGridUnit(gridUnitPixels: number, gridUnitSize: number): void {
    this.gridUnitPixels = gridUnitPixels
    this.gridUnitSize = gridUnitSize
    this.refresh()
  }

  private refresh(): void {
    this.pixelToValueRatio = this.gridUnitSize / this.gridUnitPixels
    this.onChange(this.gridUnitPixels, this.gridUnitSize, this.gridIntervalGridUnitCount)
  }
}
