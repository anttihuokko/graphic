import { Container, G, Path } from '@svgdotjs/svg.js'
import { ChartContext } from './ChartContext'
import { ChartElement } from './element/ChartElement'
import { EventType } from './Context'
import { Box } from '../model/Box'

export class GapVisualizer extends ChartElement<ChartContext> {
  private readonly gapLinesContainer: G

  private readonly gapLines: Path

  constructor(parent: Container, context: ChartContext) {
    super('chart-gaps-visualizer', parent, context)
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
      this.clip(
        new Box(
          this.dimensions.marginLeft,
          this.dimensions.marginTop,
          this.dimensions.drawAreaWidth,
          this.dimensions.viewHeight
        )
      )
      const gaps = this.context.timeSeries.getGaps()
      if (!gaps.length) {
        this.gapLinesContainer.hide()
      } else {
        const offsetDuration = this.context.timeSeries.timeUnitDuration.divide(2)
        const gapLineDefinition = gaps.reduce((acc, gap) => {
          const time = gap.endTime.minus(offsetDuration)
          return acc + `M${this.context.toPixel(time)} 0 V${this.dimensions.drawAreaHeight + 6}`
        }, '')
        this.gapLines.plot(gapLineDefinition).y(this.dimensions.drawAreaTop)
        this.gapLinesContainer.show()
      }
    }
  }
}
