import { Container, G } from '@svgdotjs/svg.js'
import { Clipper } from './Clipper'
import { Offset } from '../model/Offset'
import { Box } from '../model/Box'

export abstract class GraphicElement {
  private readonly group: G

  protected readonly container: G

  private clipper: Clipper | null = null

  constructor(className: string, parent: Container) {
    this.group = parent.group()
    this.container = this.group.group().addClass(className)
  }

  protected onFontsReady(cb: () => void): void {
    document.fonts.ready.then(cb)
  }

  get visible(): boolean {
    return this.container.visible()
  }

  get elementOffset(): Offset {
    const transform = this.container.transform()
    return new Offset(transform.translateX ?? 0, transform.translateY ?? 0)
  }

  translate(x: number, y: number): this {
    this.container.translate(x, y)
    return this
  }

  translateToX(value: number): this {
    return this.translateTo(value, this.elementOffset.y)
  }

  translateToY(value: number): this {
    return this.translateTo(this.elementOffset.x, value)
  }

  translateTo(x: number, y: number): this {
    this.container.untransform()
    return this.translate(x, y)
  }

  translateCenterTo(x: number, y: number): this {
    const bounds = this.container.bbox()
    return this.translateTo(x - Math.round(bounds.width / 2), y - Math.round(bounds.height / 2))
  }

  show(): this {
    this.setVisible(true)
    return this
  }

  hide(): this {
    this.setVisible(false)
    return this
  }

  setVisible(visible: boolean): this {
    if (visible) {
      this.container.show()
    } else {
      this.container.hide()
    }
    return this
  }

  clip(box: Box | null = null): Clipper {
    if (!this.clipper) {
      this.clipper = new Clipper(this.group)
    }
    if (box) {
      this.clipper.move(box.x, box.y).size(box.width, box.height)
    }
    return this.clipper
  }

  unclip(): this {
    if (this.clipper != null) {
      this.clipper.remove()
      this.clipper = null
    }
    return this
  }
}
