import { Container } from '@svgdotjs/svg.js'
import { BaseChartDrawer, DrawingItem } from './ChartDrawer'
import { Color } from '../../model/Color'
import { Size } from '../../model/Size'

export class AreaChartDrawer extends BaseChartDrawer {
  constructor(
    name: string,
    color: Color,
    private readonly valueField: string,
    infoTemplate: string = ''
  ) {
    super(name, color, color, valueField, valueField, [valueField], infoTemplate)
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    if (items.length) {
      const coordinates = this.toCoordinateArray(this.valueField, items)
      const startX = coordinates[0]
      const endX = coordinates[coordinates.length - 2]
      container
        .polyline([startX, Size.MAX_VIEW_SIZE.height, ...coordinates, endX, Size.MAX_VIEW_SIZE.height])
        .stroke('none')
        .fill({ color: this.color1.value, opacity: 0.16 })
      container
        .polyline(this.toCoordinateArray(this.valueField, items))
        .stroke({ color: this.color1.value, opacity: 0.8, width: 2 })
        .fill('none')
    }
  }
}
