import { Container } from '@svgdotjs/svg.js'
import { BaseChartDrawer, DrawingItem } from './ChartDrawer'
import { PathUtil } from './PathUtil'
import { Color } from '../../model/Color'
import { Size } from '../../model/Size'

export class BarChartDrawer extends BaseChartDrawer {
  constructor(
    name: string,
    color: Color,
    private readonly valueField: string,
    infoTemplate: string = '',
    enabled: boolean = true
  ) {
    super(name, color, color, valueField, valueField, [valueField], infoTemplate, enabled)
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    const pathDef = items.reduce((acc, item) => {
      const point = item.getPoint(this.valueField, this.getContext())
      return acc + PathUtil.getRectPathDef(point.x, point.y, item.drawArea.width, Size.MAX_VIEW_SIZE.height)
    }, '')
    container.path(PathUtil.trimPathDef(pathDef)).fill(this.color1.value).stroke(this.color1.value)
  }
}
