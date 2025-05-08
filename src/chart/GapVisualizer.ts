import { Container, G, Path } from '@svgdotjs/svg.js'
import { ChartContext } from './ChartContext'
import { EventType } from './Context'
import { Box } from '../model/Box'
import { GraphicElement } from '../element/GraphicElement'

export class GapVisualizer extends GraphicElement {
  private readonly gapLinesContainer: G

  private readonly gapLines: Path

  constructor(
    parent: Container,
    private readonly context: ChartContext
  ) {
    super('chart-gaps-visualizer', parent)
    this.gapLinesContainer = this.container.group()
    this.gapLines = this.gapLinesContainer.path().addClass('chart-gap-line')
    this.context.addEventListener(EventType.TIME_SERIES_DATA_UPDATE, () => this.refresh(), 100)
    this.context.addEventListener(EventType.COORDINATE_SYSTEM_UPDATE, () => this.refresh(), 100)
  }

  offset(pixels: number): void {
    this.gapLinesContainer.dx(pixels)
  }

  refresh() {
    this.setVisible(this.context.settings.gapsVisualized)
    if (this.isVisible()) {
      const dimensions = this.context.dimensions
      this.clip(new Box(dimensions.marginLeft, dimensions.marginTop, dimensions.drawAreaWidth, dimensions.viewHeight))
      const gaps = this.context.timeSeries.getGaps()
      if (!gaps.length) {
        this.gapLinesContainer.hide()
      } else {
        const offsetDuration = this.context.timeSeries.timeUnitDuration.divide(2)
        const gapLineDefinition = gaps.reduce((acc, gap) => {
          const time = gap.endTime.minus(offsetDuration)
          return acc + `M${this.context.toPixel(time)} 0 V${dimensions.drawAreaHeight + 6}`
        }, '')
        this.gapLines.plot(gapLineDefinition).y(dimensions.drawAreaTop)
        this.gapLinesContainer.show()
      }
    }
  }
}
