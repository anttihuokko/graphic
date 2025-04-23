import { Container } from '@svgdotjs/svg.js'
import { BaseChartDrawer, DrawingItem } from './ChartDrawer'
import { Color } from '../../model/Color'

export class LineChartDrawer extends BaseChartDrawer {
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
    container
      .polyline(this.toCoordinateArray(this.valueField, items))
      .stroke({ color: this.color1.value, opacity: 0.8, width: 2 })
      .fill('none')
  }
}
