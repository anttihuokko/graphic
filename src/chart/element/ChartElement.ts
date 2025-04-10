import { Container } from '@svgdotjs/svg.js'
import { GraphicElement } from '../../element/GraphicElement'
import { Context, Dimensions } from '../Context'

export abstract class ChartElement<CTX extends Context> extends GraphicElement {
  constructor(
    className: string,
    parent: Container,
    protected readonly context: CTX
  ) {
    super(className, parent)
  }

  protected get dimensions(): Dimensions {
    return this.context.dimensions
  }
}
