import { Container } from '@svgdotjs/svg.js'
import { Context } from '../Context'
import { ChartElement } from '../element/ChartElement'
import { HighlightValue } from '../HighlightManager'
import { ZoomManager } from './ZoomManager'
import { Range } from '../../model/Range'
import { AxelGrid, GridLineDefinition } from './AxelGrid'

export interface ValueFormatter {
  format(value: number, longFormat: boolean): string
}

export abstract class Axel<ZM extends ZoomManager, CTX extends Context> extends ChartElement<CTX> {
  private grid: AxelGrid<ZM>

  private valueFormatter: ValueFormatter = {
    format(_value: number): string {
      return '???'
    },
  }

  constructor(
    horizontal: boolean,
    gridlInverted: boolean,
    gridOffsetUnits: number,
    zoomManager: ZM,
    className: string,
    parent: Container,
    context: CTX
  ) {
    super(className, parent, context)
    this.grid = new AxelGrid(horizontal, gridlInverted, gridOffsetUnits, zoomManager, context)
  }

  protected getGridTotalSize(): number {
    return this.grid.getTotalSize()
  }

  protected getGridStartValue(): number {
    return this.grid.getStartValue()
  }

  protected getGridMiddleValue(): number {
    return this.grid.getMiddleValue()
  }

  protected getGridEndValue(): number {
    return this.grid.getEndValue()
  }

  protected getZoomManager(): ZM {
    return this.grid.zoomManager
  }

  protected convertValueToPixel(value: number): number {
    return this.grid.convertValueToPixel(value)
  }

  protected getGridLineDefinitions(): GridLineDefinition[] {
    return this.grid.getGridLineDefinitions(this.valueFormatter)
  }

  protected getHighlightValue(location: number, offset: number, snap: boolean): HighlightValue {
    const conversion = this.grid.convertPixelToValue(location + offset, snap)
    const displayValue = snap ? conversion.resultWithoutOffset : conversion.resultWithOffset
    return {
      value: displayValue,
      location: snap ? this.convertValueToPixel(conversion.resultWithoutOffset) : location,
      text: this.valueFormatter.format(displayValue, true),
    }
  }

  protected setValueFormatter(formatter: ValueFormatter): void {
    this.valueFormatter = formatter
  }

  protected setGaps(gaps: Range[]) {
    this.grid.setGaps(gaps)
  }

  protected offsetAxel(pixels: number): boolean {
    if (pixels === 0) {
      return false
    }
    this.grid.updateOffset(pixels)
    this.offsetElement(pixels)
    if (this.grid.isOffsetOverInterval(this.getAxelElementOffset())) {
      this.moveToValue(this.grid.gridStartValue, false)
      this.updateLabels()
    }
    return true
  }

  protected zoomAxel(amount: number): boolean {
    if (amount === 0) {
      return false
    }
    if (this.grid.updateZoom(amount)) {
      this.moveToValue(this.grid.gridStartValue, false)
      this.refresh()
      return true
    }
    return false
  }

  protected moveToValue(value: number, transformValue: boolean): void {
    const pixelOffset = this.grid.moveToValue(value, transformValue)
    this.container.untransform()
    this.offsetElement(this.grid.inverted ? -pixelOffset : pixelOffset)
  }

  protected abstract refresh(): void

  protected abstract updateLabels(): void

  private getAxelElementOffset(): number {
    return this.grid.horizontal ? this.getElementOffset().x : this.getElementOffset().y
  }

  private offsetElement(pixels: number): void {
    this.translate(this.grid.horizontal ? pixels : 0, this.grid.horizontal ? 0 : pixels)
  }
}
