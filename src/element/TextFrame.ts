import { Container, Text, Rect, G } from '@svgdotjs/svg.js'
import { GraphicElement } from './GraphicElement'
import { Size } from '../model/Size'
import { Box } from '../model/Box'

export enum TextLocation {
  RELATIVE,
  CENTER,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

export class TextDef {
  constructor(
    private location: TextLocation,
    readonly textElement: Text,
    readonly relativeIndex: number,
    private readonly refresh: (def: TextDef) => void
  ) {}

  getLocation(): TextLocation {
    return this.location
  }

  getText(): string {
    return this.textElement.text()
  }

  setText(text: string, location: TextLocation = this.location): void {
    this.location = location
    this.textElement.text(text)
    this.refresh(this)
  }
}

export class TextFrame extends GraphicElement {
  private readonly frame: Rect

  private readonly textContainer: G

  private readonly texts: TextDef[] = []

  private padding: Size = Size.ZERO

  private fixedSize: Size | null = null

  constructor(className: string, parent: Container) {
    super('graphic-text-frame', parent)
    this.container.addClass(className)
    this.frame = this.container.rect(10, 10).addClass('frame')
    this.textContainer = this.container.group()
    this.onFontsReady(() => this.refreshElement())
  }

  border(value: boolean): this {
    if (value) {
      this.frame.addClass('border')
    } else {
      this.frame.removeClass('border')
    }
    return this
  }

  round(round: number): this {
    this.frame.attr('rx', round)
    return this
  }

  getSize(): Size {
    const bounds = this.frame.bbox()
    return new Size(bounds.width, bounds.height)
  }

  setText(text: string, location?: TextLocation): this {
    if (!this.texts.length) {
      this.addText(text, location)
    } else {
      this.texts[0].setText(text, location)
    }
    this.refreshElement()
    return this
  }

  addText(text: string, location: TextLocation = TextLocation.RELATIVE): TextDef {
    const relativeCount = this.texts.reduce(
      (acc, def) => (def.getLocation() === TextLocation.RELATIVE ? acc + 1 : acc),
      0
    )
    const def = new TextDef(location, this.textContainer.text(text), relativeCount, () => this.refreshElement())
    this.texts.push(def)
    this.refreshElement()
    return def
  }

  setPadding(padding: Size): this {
    this.padding = padding
    this.refreshElement()
    return this
  }

  setSize(size: Size): this {
    this.fixedSize = size
    this.refreshElement()
    return this
  }

  protected refreshElement(): void {
    if (this.isVisible()) {
      const size = this.fixedSize ?? Size.forBox(this.textContainer.bbox())
      this.frame.size(size.width + this.padding.width * 2, size.height + this.padding.height * 2)
      this.texts.forEach((def) => this.updateTextPosition(def))
    }
  }

  private updateTextPosition(def: TextDef): void {
    const textBounds = Box.forSvgBox(def.textElement.bbox()).grow(1)
    const areaBounds = Box.forSvgBox(this.frame.bbox())
    switch (def.getLocation()) {
      case TextLocation.RELATIVE:
        def.textElement.move(this.padding.width, this.padding.height + textBounds.height * def.relativeIndex)
        break
      case TextLocation.CENTER:
        def.textElement.center(areaBounds.centerX, areaBounds.centerY)
        break
      case TextLocation.TOP:
        def.textElement.cx(areaBounds.centerX).y(this.padding.height)
        break
      case TextLocation.BOTTOM:
        def.textElement.cx(areaBounds.centerX).y(areaBounds.height - textBounds.height - this.padding.height)
        break
      case TextLocation.LEFT:
        def.textElement.x(this.padding.width).cy(areaBounds.centerY)
        break
      case TextLocation.RIGHT:
        def.textElement.x(areaBounds.width - textBounds.width - this.padding.width).cy(areaBounds.centerY)
        break
      case TextLocation.TOP_LEFT:
        def.textElement.move(this.padding.width, this.padding.height)
        break
      case TextLocation.TOP_RIGHT:
        def.textElement.move(areaBounds.width - textBounds.width - this.padding.width, this.padding.height)
        break
      case TextLocation.BOTTOM_LEFT:
        def.textElement.move(this.padding.width, areaBounds.height - textBounds.height - this.padding.height)
        break
      case TextLocation.BOTTOM_RIGHT:
        def.textElement.move(
          areaBounds.width - textBounds.width - this.padding.width,
          areaBounds.height - textBounds.height - this.padding.height
        )
        break
      default:
        throw Error(`Unknown location enum value: ${def.getLocation}`)
    }
  }
}
