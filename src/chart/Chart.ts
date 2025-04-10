import { Graphic } from '../Graphic'
import { Size } from '../model/Size'
import { Time } from '../model/Time'
import { ChartContext } from './ChartContext'
import { ChartSettings } from './ChartSettings'
import { DebugInfo } from './Context'

export abstract class Chart extends Graphic {
  protected context: ChartContext

  constructor(settings: ChartSettings, container: HTMLElement) {
    super(container)
    this.svg.addClass('chart')
    this.context = new ChartContext(
      settings,
      this.size,
      this.getAxisLabelSize(),
      (value) => this.toPixel(value),
      () => this.createDebugInfo(),
      this.symbols
    )
  }

  protected abstract toPixel(value: Time): number

  protected abstract createDebugInfo(): DebugInfo

  private getAxisLabelSize(): Size {
    const label = this.svg.text('XXXXX').addClass('chart-axis-label')
    const result = Size.forBox(label.bbox())
    label.remove()
    return result
  }
}
