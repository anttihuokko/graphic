import { Container } from '@svgdotjs/svg.js'
import { MathUtil } from '../../internal/MathUtil'
import { BaseChartDrawer, DrawingItem } from './ChartDrawer'
import { PathUtil } from './PathUtil'
import { Color } from '../../model/Color'

export class CandleStickChartDrawer extends BaseChartDrawer {
  constructor(
    name: string,
    color1: Color,
    color2: Color,
    private readonly openValueField: string,
    private readonly highValueField: string,
    private readonly lowValueField: string,
    private readonly closeValueField: string,
    infoTemplate: string = '',
    enabled: boolean = true
  ) {
    super(
      name,
      color1,
      color2,
      lowValueField,
      highValueField,
      [openValueField, highValueField, lowValueField, closeValueField],
      infoTemplate,
      enabled
    )
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    let positivePathDef = ''
    let negativePathDef = ''
    items.forEach((item) => {
      const open = item.getY(this.openValueField, this.getContext())
      const high = item.getY(this.highValueField, this.getContext())
      const low = item.getY(this.lowValueField, this.getContext())
      const close = item.getY(this.closeValueField, this.getContext())
      const bodyTop = Math.min(open, close)
      const bodyBottom = Math.max(open, close)
      const bodyWidth = MathUtil.clamp(item.drawArea.width - 2, 3, 30)
      const bodyHeight = Math.abs(open - close)
      const highWickHeight = bodyTop - high
      const lowWickHeight = low - bodyBottom
      const x = item.getX()
      const y = high
      const def =
        this.createWickPathDef(x, y, highWickHeight) +
        PathUtil.getRectPathDef(x, y + highWickHeight, bodyWidth, bodyHeight) +
        this.createWickPathDef(x, y + highWickHeight + bodyHeight, lowWickHeight)
      if (item.getNumberValue(this.openValueField) <= item.getNumberValue(this.closeValueField)) {
        positivePathDef += def
      } else {
        negativePathDef += def
      }
    })
    container.path(PathUtil.trimPathDef(positivePathDef)).fill(this.color1.value).stroke(this.color1.value)
    container.path(PathUtil.trimPathDef(negativePathDef)).fill(this.color2.value).stroke(this.color2.value)
  }

  private createWickPathDef(x: number, y: number, height: number): string {
    return `
      M ${x} ${y}
      v ${height}
    `
  }
}
