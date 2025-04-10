import { Container } from '@svgdotjs/svg.js'
import { ChartFrame, Location } from '../element/ChartFrame'
import { PanelContext } from './PanelContext'
import { Box } from '../../model/Box'

export class DataLoadingIndicator extends ChartFrame {
  constructor(parent: Container, context: PanelContext) {
    super('chart-loading-indicator', '', parent, context)
    this.addText('Loading...', Location.CENTER)
    this.showIndicator()
  }

  showIndicator(): void {
    this.container.addClass('show')
    this.refresh()
  }

  hideIndicator(): void {
    this.container.removeClass('show')
  }

  protected positionElements(): Box {
    return new Box(4, this.context.dimensions.drawAreaHeight - 24, 70, 22)
  }
}
