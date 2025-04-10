import { Container, Rect, Symbol } from '@svgdotjs/svg.js'
import { GraphicElement } from '../../element/GraphicElement'

export class ChartButton extends GraphicElement {
  private readonly rect: Rect

  constructor(symbol: Symbol, className: string, parent: Container) {
    super('chart-button', parent)
    this.rect = this.container.rect(26, 24).attr('rx', 4).addClass(className).addClass('interactive')
    this.container.use(symbol).addClass('chart-button-icon').move(3, 2)
  }

  setSelected(selected: boolean): this {
    if (selected) {
      this.container.addClass('selected')
    } else {
      this.container.removeClass('selected')
    }
    return this
  }
}
