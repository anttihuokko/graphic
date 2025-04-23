import { Container, Rect } from '@svgdotjs/svg.js'
import { GraphicEvent } from '../GraphicEvent'
import { Size } from '../model/Size'
import { Box } from '../model/Box'
import { GraphicContainerElement } from './GraphicContainerElement'

export class ContainerFrame extends GraphicContainerElement {
  private readonly frame: Rect

  private padding: Size = Size.ZERO

  private fixedSize: Size | null = null

  constructor(className: string, parent: Container) {
    super('graphic-container-frame', parent)
    this.container.addClass(className)
    this.frame = this.container.rect(1, 1).addClass('frame').back()
    this.onFontsReady(() => this.refreshElement())
  }

  isEventTarget(event: GraphicEvent): boolean {
    return this.frame === event.targetElement
  }

  border(value: boolean): this {
    if (value) {
      this.frame.addClass('border')
    } else {
      this.frame.removeClass('border')
    }
    return this
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

  getSize(): Size {
    const bounds = this.frame.bbox()
    return new Size(bounds.width, bounds.height)
  }

  interactive(eventTargetClassName: string): this {
    this.frame.addClass(eventTargetClassName).addClass('interactive')
    return this
  }

  protected refreshElement(): void {
    if (this.isVisible()) {
      const size = this.fixedSize ?? Size.forBox(this.childContainer.bbox())
      this.frame.size(size.width + this.padding.width * 2, size.height + this.padding.height * 2)
      this.clip(Box.forSvgBox(this.frame.bbox()).move(this.getElementOffset().x, this.getElementOffset().y).grow(1))
      this.childContainer.untransform().translate(this.padding.width, this.padding.height)
    }
  }
}
