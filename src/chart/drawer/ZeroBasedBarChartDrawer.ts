import { Container } from '@svgdotjs/svg.js'
import { BaseChartDrawer, DrawingItem } from './ChartDrawer'
import { PathUtil } from './PathUtil'
import { Color } from '../../model/Color'

export class ZeroBasedBarChartDrawer extends BaseChartDrawer {
  constructor(
    name: string,
    color1: Color,
    color2: Color,
    private readonly valueField: string,
    infoTemplate: string = ''
  ) {
    super(name, color1, color2, valueField, valueField, [valueField], infoTemplate)
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    let positivePathDef = ''
    let negativePathDef = ''
    const zeroY = items.length ? this.getContext().toY(0) : 0
    items.forEach((item) => {
      const point = item.getPoint(this.valueField, this.getContext())
      const def = PathUtil.getRectPathDef(point.x, point.y, item.drawArea.width, zeroY - point.y)
      if (item.getNumberValue(this.valueField) >= 0) {
        positivePathDef += def
      } else {
        negativePathDef += def
      }
    })
    container.path(PathUtil.trimPathDef(positivePathDef)).fill(this.color1.value).stroke(this.color1.value)
    container.path(PathUtil.trimPathDef(negativePathDef)).fill(this.color2.value).stroke(this.color2.value)
  }
}
