import { Rect, Path, Container, Text, G } from '@svgdotjs/svg.js'
import { GraphicEvent } from '../../GraphicEvent'
import { ChartContext } from '../ChartContext'
import { HighlightValue } from '../HighlightManager'
import { TimeSeriesSection } from '../data/TimeSeries'
import { Axel, ValueFormatter } from './Axel'
import { ZoomManager } from './ZoomManager'
import { MathUtil } from '../../internal/MathUtil'
import { EventType } from '../Context'
import { Box } from '../../model/Box'
import { Range } from '../../model/Range'
import { Time, Duration } from '../../model/Time'

type Anchor = {
  time: Time
  position: 'START' | 'CENTER' | 'END'
}

class XAxelValueFormatter implements ValueFormatter {
  format(value: number, longFormat: boolean): string {
    const time = Time.fromMillis(value)
    return time.format(this.getFormat(time, longFormat))
  }

  private getFormat(time: Time, longFormat: boolean): string {
    if (time.hour === 0 && time.minute === 0) {
      return 'd.M.yyyy'
    }
    if (longFormat) {
      return 'HH:mm d.M.yyyy'
    }
    return 'HH:mm'
  }
}

class XAxelZoomManager extends ZoomManager {
  constructor(context: ChartContext) {
    super(new Range(70, 140), (gridUnitPixels) => context.setGridUnitWidth(gridUnitPixels))
  }

  setGridUnitDuration(duration: Duration): void {
    this.setGridUnit(this.preferredGridIntervalPixels, duration.toMillis())
    this.updateZoom(90)
  }
}

export class XAxel extends Axel<XAxelZoomManager, ChartContext> {
  private static readonly TICK_SIZE = 5

  private readonly gridLines: Path

  private readonly tickLines: Path

  private readonly labels: Text[] = []

  private readonly labelContainer: G

  private readonly grabArea: Rect

  private activeAnchor: Anchor | null = null

  constructor(parent: Container, context: ChartContext) {
    super(true, false, 0.5, new XAxelZoomManager(context), 'chart-x-axel', parent, context)
    this.setValueFormatter(new XAxelValueFormatter())
    this.gridLines = this.container.path().addClass('chart-grid-line')
    this.tickLines = this.container.path().addClass('chart-grid-tick')
    this.labelContainer = this.container.group().addClass('chart-grid-labels')
    this.grabArea = this.container.rect().addClass('chart-xaxel-grab-area').addClass('interactive')
    this.context.addEventListener(EventType.TIME_SERIES_DATA_UPDATE, () => this.refreshTimeSeriesGaps())
    this.context.addEventListener(EventType.SETTINGS_UPDATE, () => this.refreshTimeSeriesGaps())
    this.resetTimeUnit()
    this.moveEndToTime(Time.now().startOf('day'))
  }

  getVisibleStartTime(): Time {
    return Time.fromMillis(this.getGridStartValue())
  }

  getVisibleMiddleTime(): Time {
    return Time.fromMillis(this.getGridMiddleValue())
  }

  getVisibleEndTime(): Time {
    return Time.fromMillis(this.getGridEndValue())
  }

  getVisibleTimeSeriesSection(): TimeSeriesSection {
    const timeUnitMills = this.context.timeUnitDuration.toMillis()
    const middleTime = Time.fromMillis(MathUtil.roundBy(this.getGridMiddleValue(), timeUnitMills))
    const halfGridUnitCount = Math.ceil(this.getGridTotalSize() / timeUnitMills / 2)
    return new TimeSeriesSection(middleTime, halfGridUnitCount, halfGridUnitCount)
  }

  toPixel(time: Time): number {
    return this.convertValueToPixel(time.toMillis())
  }

  toHighlightValue(event: GraphicEvent): HighlightValue {
    return this.getHighlightValue(event.documentPoint.x, 0, event.shiftKey)
  }

  offset(pixels: number, callback: () => void = () => undefined): void {
    if (this.offsetAxel(pixels)) {
      this.activeAnchor = null
      callback()
    }
  }

  zoom(amount: number, callback: () => void = () => undefined): void {
    if (this.zoomAxel(amount)) {
      this.activeAnchor = null
      callback()
    }
  }

  moveStartToTime(time: Time): void {
    this.activeAnchor = { time: time, position: 'START' }
    this.moveToAnchor(this.activeAnchor)
  }

  moveCenterToTime(time: Time): void {
    this.activeAnchor = { time: time, position: 'CENTER' }
    this.moveToAnchor(this.activeAnchor)
  }

  moveEndToTime(time: Time): void {
    this.activeAnchor = { time: time, position: 'END' }
    this.moveToAnchor(this.activeAnchor)
  }

  reposition(): void {
    this.refresh()
  }

  resetTimeUnit(): void {
    this.getZoomManager().setGridUnitDuration(this.context.timeSeries.timeUnitDuration)
    this.refresh()
  }

  protected refresh() {
    this.clip(
      new Box(
        this.dimensions.marginLeft,
        this.dimensions.marginTop,
        this.dimensions.drawAreaWidth,
        this.dimensions.viewHeight
      )
    )
    this.labels.length = 0
    this.labelContainer.clear()
    let gridLinesPathDefinition = ''
    let ticksPathDefinition = ''
    this.getGridLineDefinitions().forEach((def) => {
      gridLinesPathDefinition += `M${def.position} 0 V${this.dimensions.drawAreaHeight}`
      ticksPathDefinition += `M${def.position} 0 V${XAxel.TICK_SIZE}`
      this.labels.push(this.labelContainer.text(def.label).cx(def.position).y(0))
    })
    this.gridLines.plot(gridLinesPathDefinition).y(this.dimensions.drawAreaTop)
    this.tickLines.plot(ticksPathDefinition).y(this.dimensions.drawAreaBottom)
    this.labelContainer.y(this.dimensions.drawAreaBottom + 7)
    this.grabArea
      .size(this.dimensions.viewWidth * 2, this.dimensions.marginBottom)
      .move(-this.dimensions.viewWidth / 2, this.dimensions.drawAreaBottom)
  }

  protected updateLabels(): void {
    const defs = this.getGridLineDefinitions()
    this.labels.forEach((label, index) => {
      const def = defs[index]
      label.text(def.label).cx(def.position)
    })
  }

  private refreshTimeSeriesGaps() {
    if (this.context.settings.gapsRemoved) {
      const originalStartTime = this.getVisibleStartTime()
      this.setGaps(
        this.context.timeSeries.getGaps().map((gap) => new Range(gap.startTime.toMillis(), gap.endTime.toMillis()))
      )
      if (this.activeAnchor) {
        this.moveToAnchor(this.activeAnchor)
      } else {
        this.moveToAnchor({ time: originalStartTime, position: 'START' })
      }
    } else {
      this.setGaps([])
      this.refresh()
    }
  }

  private moveToAnchor(anchor: Anchor) {
    this.moveToValue(anchor.time.toMillis(), true)
    const offset = (() => {
      switch (anchor.position) {
        case 'START':
          return 0
        case 'CENTER':
          return this.context.dimensions.drawAreaWidth / 2
        case 'END':
          return this.context.dimensions.drawAreaWidth
        default:
          throw Error(`Unknown anchor position ${anchor.position}`)
      }
    })()
    this.offsetAxel(offset)
    this.refresh()
  }
}
