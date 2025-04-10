import * as _ from 'lodash'
import { Container, Path, G, Text, Rect } from '@svgdotjs/svg.js'
import { Axel, ValueFormatter } from './Axel'
import { GraphicEvent } from '../../GraphicEvent'
import { HighlightValue } from '../HighlightManager'
import { PanelContext } from '../panel/PanelContext'
import { EventType } from '../Context'
import { ZoomManager } from './ZoomManager'
import { getGridDefinition } from './GridDefinition'
import { Box } from '../../model/Box'
import { Range } from '../../model/Range'

class YAxelValueFormatter implements ValueFormatter {
  private readonly scale: number

  private readonly abbreviation: string

  private readonly fractionDigitCount: number

  constructor(valueRange: Range) {
    const magnitude = valueRange.size
    if (magnitude >= 1000000000000) {
      this.scale = 1000000000000
      this.abbreviation = 'T'
    } else if (magnitude >= 1000000000) {
      this.scale = 1000000000
      this.abbreviation = 'B'
    } else if (magnitude >= 1000000) {
      this.scale = 1000000
      this.abbreviation = 'M'
    } else if (magnitude >= 10000) {
      this.scale = 1000
      this.abbreviation = 'K'
    } else {
      this.scale = 1
      this.abbreviation = ''
    }
    this.fractionDigitCount = this.getFractionDigitCount(magnitude, this.scale)
  }

  format(value: number): string {
    const scaledValue = value / this.scale
    if (scaledValue === 0) {
      return '0'
    }
    return scaledValue.toFixed(this.fractionDigitCount) + this.abbreviation
  }

  private getFractionDigitCount(magnitude: number, scale: number): number {
    return magnitude / scale < 10 ? 1 : 0
  }
}

class YAxelZoomManager extends ZoomManager {
  private readonly zoomMultipliers = [1, 2, 2.5, 4, 5]

  constructor(context: PanelContext) {
    super(new Range(40, 90), (gridUnitPixels) => context.setGridUnitHeight(gridUnitPixels))
  }

  updateForValueRange(valueRange: Range, totalGridPixels: number): void {
    const def = getGridDefinition(valueRange, totalGridPixels, this.preferredGridIntervalPixels, this.zoomMultipliers)
    this.setGridUnit(def.gridIntervalPixels, def.gridIntervalSize)
  }
}

export class YAxel extends Axel<YAxelZoomManager, PanelContext> {
  private static readonly TICK_SIZE = 5

  private readonly gridLines: Path

  private readonly tickLines: Path

  private readonly labels: Text[] = []

  private readonly labelContainer: G

  private readonly grabArea: Rect

  constructor(parent: Container, context: PanelContext) {
    super(false, true, 0, new YAxelZoomManager(context), 'chart-y-axel', parent, context)
    this.gridLines = this.container.path().addClass('chart-grid-line')
    this.tickLines = this.container.path().addClass('chart-grid-tick')
    this.labelContainer = this.container.group().addClass('chart-grid-labels')
    this.grabArea = this.container
      .rect()
      .addClass('chart-yaxel-grab-area')
      .addClass('interactive')
      .data('panel-id', context.panelId)
    this.displayValueRange(Range.EMPTY)
    this.context.addEventListener(EventType.REPOSITION, () => this.refresh())
  }

  getVisibleRange(): Range {
    return new Range(_.round(this.getGridStartValue(), 3), _.round(this.getGridEndValue(), 3))
  }

  toPixel(value: number): number {
    return this.convertValueToPixel(value)
  }

  toHighlightValue(event: GraphicEvent): HighlightValue {
    return this.getHighlightValue(event.documentPoint.y, -this.dimensions.drawAreaTop + 1, false)
  }

  offset(pixels: number, callback: () => void = () => undefined): void {
    if (this.offsetAxel(pixels)) {
      callback()
    }
  }

  zoom(amount: number, callback: () => void = () => undefined): void {
    if (this.zoomAxel(amount)) {
      callback()
    }
  }

  moveStartToValue(value: number): void {
    this.moveToValue(value, true)
    this.refresh()
  }

  moveCenterToValue(value: number): void {
    this.moveStartToValue(value - this.getVisibleRange().size / 2)
  }

  moveEndToValue(value: number): void {
    this.moveStartToValue(value - this.getVisibleRange().size)
  }

  fitValueRange(force: boolean, valueRange: Range, callback: () => void = () => undefined): void {
    const range = this.getVisibleRange()
    const startOffset = (valueRange.start - range.start) / range.size
    const endOffset = (valueRange.end - range.end) / range.size
    if (force || Math.abs(startOffset) > 0.2 || endOffset < 0.2) {
      this.displayValueRange(valueRange.isEmpty() ? valueRange.grow(1) : valueRange)
      this.offsetAxel(-8)
      callback()
    }
  }

  protected refresh(): void {
    this.clip(new Box(1, 1, this.dimensions.viewWidth, this.dimensions.drawAreaHeight))
    this.labels.length = 0
    this.labelContainer.clear()
    let gridLinesPathDefinition = ''
    let ticksPathDefinition = ''
    this.getGridLineDefinitions().forEach((def) => {
      gridLinesPathDefinition += `M0 ${def.position} H${this.dimensions.drawAreaWidth}`
      ticksPathDefinition += `M0 ${def.position} H${YAxel.TICK_SIZE}`
      this.labels.push(this.labelContainer.text(def.label).cy(def.position))
    })
    this.gridLines.plot(gridLinesPathDefinition)
    const gridLinesHeight = this.gridLines.bbox().height
    this.gridLines.move(this.dimensions.drawAreaLeft, this.height - gridLinesHeight)
    this.tickLines.plot(ticksPathDefinition).move(this.dimensions.drawAreaRight, this.height - gridLinesHeight)
    this.labelContainer.untransform().translate(this.dimensions.drawAreaRight + 8, 0)
    this.grabArea
      .size(this.dimensions.marginRight, this.dimensions.viewHeight * 2)
      .move(this.dimensions.drawAreaRight, -this.dimensions.viewHeight / 2)
  }

  protected updateLabels(): void {
    const defs = this.getGridLineDefinitions()
    this.labels.forEach((label, index) => label.text(defs[index].label))
  }

  private get height(): number {
    return this.dimensions.drawAreaHeight
  }

  private displayValueRange(valueRange: Range) {
    this.getZoomManager().updateForValueRange(valueRange, this.dimensions.drawAreaHeight)
    this.moveToValue(valueRange.start, true)
    this.setValueFormatter(new YAxelValueFormatter(this.getVisibleRange()))
    this.refresh()
  }
}
