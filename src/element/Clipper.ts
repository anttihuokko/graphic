import { Container, Rect } from '@svgdotjs/svg.js'
import { Size } from '../model/Size'

export class Clipper {
  private readonly cutter: Rect

  private readonly clipper: Container

  constructor(clipped: Container) {
    this.cutter = clipped.rect().size(Size.MAX_VIEW_SIZE.width, Size.MAX_VIEW_SIZE.height)
    this.clipper = clipped.clipWith(this.cutter)
  }

  move(x: number, y: number): this {
    this.cutter.move(x, y)
    return this
  }

  size(width: number, height: number): this {
    this.cutter.size(width, height)
    return this
  }

  remove(): void {
    this.cutter.remove()
    this.clipper.clipper().remove()
  }
}
