import { Container } from '@svgdotjs/svg.js'
import { BaseChartDrawer, DrawingItem } from './ChartDrawer'
import { Color } from '../../model/Color'

export class ChannelChartDrawer extends BaseChartDrawer {
  constructor(
    name: string,
    color: Color,
    private readonly upperBandField: string,
    private readonly lowerBandField: string,
    infoTemplate: string = '',
    enabled: boolean = true
  ) {
    super(name, color, color, upperBandField, lowerBandField, [upperBandField, lowerBandField], infoTemplate, enabled)
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    const uppedBandPoints = this.toCoordinateArray(this.upperBandField, items)
    const lowerBandPoints = this.toCoordinateArray(this.lowerBandField, items.reverse())
    const channel = container.group()
    channel
      .polygon(uppedBandPoints.concat(lowerBandPoints))
      .fill({ color: this.color1.value, opacity: 0.05 })
      .stroke('none')
    channel.polyline(uppedBandPoints).stroke(this.color1.value).fill('none')
    channel.polyline(lowerBandPoints).stroke(this.color1.value).fill('none')
  }
}
