import { Container, Text, Rect } from '@svgdotjs/svg.js'
import { GraphicElement } from './GraphicElement'

export class FramedText extends GraphicElement {
  private readonly frame: Rect

  private readonly text: Text

  private padding = 3

  constructor(parent: Container, round: number = 0) {
    super('graphic-framed-text', parent)
    this.frame = this.container.rect(10, 10).attr('rx', round)
    this.text = this.container.text('')
    this.onFontsReady(() => this.refresh())
  }

  setText(value: string): this {
    this.text.text(value)
    this.refresh()
    return this
  }

  setPadding(value: number): this {
    this.padding = value
    return this
  }

  private refresh(): void {
    this.text.move(this.padding, this.padding)
    const textBounds = this.text.bbox()
    this.frame.size(textBounds.width + this.padding * 2, textBounds.height + this.padding * 2)
  }
}
