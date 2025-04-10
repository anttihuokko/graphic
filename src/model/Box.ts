import { Box as SvgBox } from '@svgdotjs/svg.js'
import { Size } from './Size'

export class Box {
  static readonly EMPTY = new Box(0, 0, 0, 0)

  static forSvgBox(box: SvgBox) {
    return new Box(box.x, box.y, box.width, box.height)
  }

  readonly width: number

  readonly height: number

  constructor(
    readonly x: number,
    readonly y: number,
    w: number,
    h: number
  ) {
    this.width = Math.max(0, w)
    this.height = Math.max(0, h)
  }

  get left(): number {
    return this.x
  }

  get right(): number {
    return this.x + this.width
  }

  get top(): number {
    return this.y
  }

  get bottom(): number {
    return this.y + this.height
  }

  get centerX(): number {
    return this.x + Math.round(this.width / 2)
  }

  get centerY(): number {
    return this.y + Math.round(this.height / 2)
  }

  isEmpty(): boolean {
    return this.width === 0 || this.height === 0
  }

  getSize(): Size {
    return new Size(this.width, this.height)
  }

  contains(x: number, y: number): boolean {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
  }

  move(x: number, y: number): Box {
    return new Box(x, y, this.width, this.height)
  }

  grow(amount: number): Box {
    return new Box(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2)
  }

  shrink(amount: number): Box {
    return this.grow(-amount)
  }

  cutLeft(x: number): Box {
    if (x > this.left && x < this.right) {
      const amount = x - this.left
      return new Box(this.x + amount, this.y, this.width - amount, this.height)
    }
    return this
  }

  cutRight(x: number): Box {
    if (x > this.left && x < this.right) {
      const amount = this.right - x
      return new Box(this.x, this.y, this.width - amount, this.height)
    }
    return this
  }
}
