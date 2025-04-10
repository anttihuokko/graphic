import { ChartContext } from '../ChartContext'
import { Context, DebugInfo, Dimensions } from '../Context'
import { TimeSeries } from '../data/TimeSeries'
import { Offset } from '../../model/Offset'
import { Box } from '../../model/Box'
import { Range } from '../../model/Range'
import { Time } from '../../model/Time'
import { ChartSettings } from '../ChartSettings'

export class PanelContext extends Context {
  private static panelIdSequence = 0

  readonly panelId = `panel-${++PanelContext.panelIdSequence}`

  readonly toX: (value: Time) => number

  private currentFirstPanel = false

  private currentLastPanel = false

  private currentDimensions = Dimensions.EMPTY

  private currentGridUnitHeight = 20

  private currentViewOffset = Offset.ZERO

  private currentDrawValueRange = Range.EMPTY

  constructor(
    readonly toY: (value: number) => number,
    private readonly createDebugInfo: () => DebugInfo,
    readonly chartContext: ChartContext
  ) {
    super(chartContext.symbols)
    this.toX = chartContext.toPixel
    this.updateDimensions(true, true, chartContext.dimensions.drawAreaTop, chartContext.dimensions.drawAreaHeight)
  }

  get settings(): ChartSettings {
    return this.chartContext.settings
  }

  getDebugInfo(): DebugInfo {
    return [...this.chartContext.getDebugInfo(), ...this.createDebugInfo()]
  }

  get firstPanel(): boolean {
    return this.currentFirstPanel
  }

  get lastPanel(): boolean {
    return this.currentLastPanel
  }

  get onlyPanel(): boolean {
    return this.firstPanel && this.lastPanel
  }

  get dimensions(): Dimensions {
    return this.currentDimensions
  }

  get gridUnitWidth(): number {
    return this.chartContext.gridUnitWidth
  }

  get gridUnitHeight(): number {
    return this.currentGridUnitHeight
  }

  get viewOffset(): Offset {
    return this.currentViewOffset
  }

  get timeSeries(): TimeSeries {
    return this.chartContext.timeSeries
  }

  get highlightTime(): Time | null {
    return this.chartContext.highlightTime
  }

  get drawValueRange(): Range {
    return this.currentDrawValueRange
  }

  updateDimensions(first: boolean, last: boolean, top: number, height: number): void {
    this.currentFirstPanel = first
    this.currentLastPanel = last
    this.currentDimensions = new Dimensions(
      this.chartContext.dimensions.labelSize,
      new Box(
        this.chartContext.dimensions.drawArea.left,
        Math.round(top),
        this.chartContext.dimensions.drawArea.width,
        Math.round(height)
      ),
      this.chartContext.dimensions.viewSize
    )
  }

  setGridUnitHeight(value: number): void {
    this.currentGridUnitHeight = value
  }

  setViewOffset(offset: Offset): void {
    this.currentViewOffset = offset
  }

  setDrawValueRange(range: Range): void {
    this.currentDrawValueRange = range
  }
}
