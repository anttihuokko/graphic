import { Container, G, Line } from '@svgdotjs/svg.js'
import { FramedText } from '../element/FramedText'
import { ChartContext } from './ChartContext'
import { EventType } from './Context'
import { ChartElement } from './element/ChartElement'
import { Time } from '../model/Time'

export interface HighlightValue {
  value: number
  location: number
  text: string
}

class XHighlight extends ChartElement<ChartContext> {
  private static readonly MARGIN = 3

  private readonly line: Line

  private readonly text: FramedText

  constructor(parent: Container, context: ChartContext) {
    super('chart-highlight', parent, context)
    this.line = this.container.line(0, 0, 0, 1)
    this.text = new FramedText(this.container, 2)
  }

  setHighlight(value: HighlightValue): void {
    this.text
      .setText(value.text)
      .translateCenterTo(0, 0)
      .translateToY(this.dimensions.drawAreaBottom + XHighlight.MARGIN)
    this.line.plot(0, 0, 0, this.dimensions.drawAreaHeight).move(0, this.dimensions.drawAreaTop + XHighlight.MARGIN * 2)
    this.translateTo(value.location, 0)
  }
}

class YHighlight extends ChartElement<ChartContext> {
  private static readonly MARGIN = 4

  private readonly line: Line

  private readonly text: FramedText

  constructor(parent: Container, context: ChartContext) {
    super('chart-highlight', parent, context)
    this.line = this.container.line(0, 0, 1, 0)
    this.text = new FramedText(this.container, 2)
  }

  setHighlight(value: HighlightValue): void {
    this.text
      .setText(value.text)
      .translateCenterTo(0, 0)
      .translateToX(this.dimensions.drawAreaRight + YHighlight.MARGIN)
    this.line.plot(0, 0, this.dimensions.drawAreaWidth, 0).move(YHighlight.MARGIN, this.dimensions.drawAreaTop - 1)
    this.translateTo(0, value.location)
  }
}

export class HighlightManager {
  private readonly container: G

  private readonly xHighlight: XHighlight

  private readonly yHighlight: YHighlight

  constructor(
    parent: Container,
    private readonly context: ChartContext
  ) {
    this.container = parent.group().addClass('chart-highlights')
    this.xHighlight = new XHighlight(this.container, context)
    this.yHighlight = new YHighlight(this.container, context)
    this.clearHighlight()
  }

  setHighlight(xValue: HighlightValue, yValue: HighlightValue): void {
    if (this.context.dimensions.drawArea.contains(xValue.location, yValue.location)) {
      this.xHighlight.setHighlight(xValue)
      this.yHighlight.setHighlight(yValue)
      this.container.show()
      this.handleChange(Time.fromMillis(xValue.value))
    } else {
      this.clearHighlight()
    }
  }

  clearHighlight(): void {
    if (this.container.visible()) {
      this.container.hide()
      this.handleChange(null)
    }
  }

  private handleChange(time: Time | null): void {
    this.context.setHighlightTime(time)
    this.context.fireEvent(EventType.HIGHLIGHT_CHANGE)
  }
}
