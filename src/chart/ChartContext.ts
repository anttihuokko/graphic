import { Symbols } from '../Symbols'
import { Context, DebugInfo, Dimensions } from './Context'
import { TimeSeries } from './data/TimeSeries'
import { Size } from '../model/Size'
import { Box } from '../model/Box'
import { Time, Duration } from '../model/Time'
import { ChartSettings } from './ChartSettings'

export interface PanelsMeta {
  readonly openPanelCount: number
  readonly totalPanelCount: number
}

export class ChartContext extends Context {
  private currentSettings: ChartSettings

  private currentDimensions: Dimensions

  private currentGridUnitWidth = 20

  private currentTimeSeries = TimeSeries.createEmpty(Duration.forDays(1))

  private currentHighlightTime: Time | null = null

  private currentPanelsMeta: PanelsMeta = { openPanelCount: 0, totalPanelCount: 0 }

  constructor(
    settings: ChartSettings,
    viewSize: Size,
    labelSize: Size,
    readonly toPixel: (value: Time) => number,
    private readonly createDebugInfo: () => DebugInfo,
    symbols: Symbols
  ) {
    super(symbols)
    this.currentSettings = settings
    this.currentDimensions = this.createDimensions(viewSize, labelSize)
  }

  get settings(): ChartSettings {
    return this.currentSettings
  }

  getDebugInfo(): DebugInfo {
    return this.createDebugInfo()
  }

  get dimensions(): Dimensions {
    return this.currentDimensions
  }

  get gridUnitWidth(): number {
    return this.currentGridUnitWidth
  }

  get timeUnitDuration(): Duration {
    return this.currentTimeSeries.timeUnitDuration
  }

  get timeSeries(): TimeSeries {
    return this.currentTimeSeries
  }

  get highlightTime(): Time | null {
    return this.currentHighlightTime
  }

  get panelsMeta(): PanelsMeta {
    return this.currentPanelsMeta
  }

  updateSettings(settings: ChartSettings): void {
    this.currentSettings = settings
  }

  updateDimensions(viewSize: Size): void {
    this.currentDimensions = this.createDimensions(viewSize, this.dimensions.labelSize)
  }

  setGridUnitWidth(value: number): void {
    this.currentGridUnitWidth = value
  }

  setTimeUnitDuration(duration: Duration): void {
    this.setTimeSeries(TimeSeries.createEmpty(duration))
  }

  setTimeSeries(timeSeries: TimeSeries): void {
    this.currentTimeSeries = timeSeries
  }

  clearTimeSeries(): void {
    this.setTimeSeries(TimeSeries.createEmpty(this.timeUnitDuration))
  }

  setHighlightTime(time: Time | null) {
    this.currentHighlightTime = time
  }

  updatePanelsMeta(openPanelCount: number, totalPanelCount: number): void {
    this.currentPanelsMeta = { openPanelCount, totalPanelCount }
  }

  private createDimensions(viewSize: Size, labelSize: Size): Dimensions {
    return new Dimensions(
      labelSize,
      new Box(1, 1, viewSize.width - labelSize.width, viewSize.height - labelSize.height * 1.5),
      viewSize
    )
  }
}
