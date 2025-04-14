import { Container, Symbol } from '@svgdotjs/svg.js'
import { GraphicElement } from './GraphicElement'
import { Offset } from '../model/Offset'

export class Button extends GraphicElement {
  private static readonly textPadding = new Offset(14, 8)

  private static readonly iconPadding = new Offset(5, 4)

  constructor(content: string | Symbol, className: string, parent: Container) {
    super('graphic-button', parent)
    if (typeof content === 'string') {
      this.onFontsReady(() => {
        const rect = this.container.rect().attr('rx', 4).addClass(className).addClass('interactive')
        const textBounds = this.container.text(content).move(Button.textPadding.x, Button.textPadding.y).bbox()
        rect.size(textBounds.width + Button.textPadding.x * 2, textBounds.height + Button.textPadding.y * 2)
      })
    } else {
      this.container.rect(30, 28).attr('rx', 4).addClass(className).addClass('interactive')
      this.container.use(content).addClass('graphic-button-icon').move(Button.iconPadding.x, Button.iconPadding.y)
    }
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
