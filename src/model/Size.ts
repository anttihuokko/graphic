import { Box as SvgBox } from '@svgdotjs/svg.js'

export class Size {
  static readonly ZERO = new Size(0, 0)

  static readonly MAX_VIEW_SIZE = new Size(10000, 10000)

  static forBox(box: SvgBox) {
    return new Size(Math.ceil(box.width), Math.ceil(box.height))
  }

  constructor(
    readonly width: number,
    readonly height: number
  ) {}

  isZero(): boolean {
    return this.width === 0 && this.height === 0
  }
}
