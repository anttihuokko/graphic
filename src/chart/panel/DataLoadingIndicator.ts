import { Container } from '@svgdotjs/svg.js'
import { PanelContext } from './PanelContext'
import { TextLocation, TextFrame } from '../../element/TextFrame'
import { Size } from '../../model/Size'
import { EventType } from '../Context'

export class DataLoadingIndicator extends TextFrame {
  constructor(
    parent: Container,
    private readonly context: PanelContext
  ) {
    super('chart-loading-indicator', parent)
    this.setPadding(new Size(6, 3)).setText('Loading...', TextLocation.CENTER)
    context.addEventListener(EventType.REPOSITION, () => this.refresh())
    this.showIndicator()
  }

  showIndicator(): void {
    this.container.addClass('show')
    this.refresh()
  }

  hideIndicator(): void {
    this.container.removeClass('show')
  }

  private refresh(): void {
    this.translateTo(4, this.context.dimensions.drawAreaHeight - 22)
    this.refreshElement()
  }
}
