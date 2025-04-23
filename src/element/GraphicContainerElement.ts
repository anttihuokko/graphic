import {
  Circle,
  Container,
  Element,
  Ellipse,
  G,
  Line,
  NumberAlias,
  Path,
  PathArrayAlias,
  PointArrayAlias,
  Polygon,
  Polyline,
  Rect,
  Symbol,
  Text,
  Use,
} from '@svgdotjs/svg.js'
import { GraphicElement } from './GraphicElement'

export abstract class GraphicContainerElement extends GraphicElement {
  protected readonly childContainer: G

  constructor(className: string, parent: Container) {
    super(className, parent)
    this.childContainer = this.container.group()
  }

  group(): G {
    return this.childContainer.group()
  }

  circle(size?: NumberAlias): Circle {
    return this.childContainer.circle(size)
  }

  ellipse(width?: number, height?: number): Ellipse {
    return this.childContainer.ellipse(width, height)
  }

  children(): Element[] {
    return this.childContainer.children().toArray()
  }

  line(points?: PointArrayAlias): Line
  line(x1: number, y1: number, x2: number, y2: number): Line
  line(pointsOrX1?: PointArrayAlias | number, y1: number = 0, x2: number = 0, y2: number = 0): Line {
    if (pointsOrX1 === undefined) {
      return this.childContainer.line()
    }
    if (typeof pointsOrX1 === 'number') {
      return this.childContainer.line(pointsOrX1, y1, x2, y2)
    }
    return this.childContainer.line(pointsOrX1)
  }

  path(): Path
  path(d: PathArrayAlias = ''): Path {
    return this.childContainer.path(d)
  }

  polygon(points?: PointArrayAlias): Polygon {
    return this.childContainer.polygon(points)
  }

  polyline(points?: PointArrayAlias): Polyline {
    return this.childContainer.polyline(points)
  }

  rect(width?: NumberAlias, height?: NumberAlias): Rect {
    return this.childContainer.rect(width, height)
  }

  text(text: string): Text {
    return this.childContainer.text(text)
  }

  use(element: Element | string, file?: string): Use {
    return this.childContainer.use(element, file)
  }

  symbol(): Symbol {
    return this.childContainer.symbol()
  }
}
