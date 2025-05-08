import { Container } from '@svgdotjs/svg.js'
import { ChartDrawer, DrawingItem } from '../drawer/ChartDrawer'
import { PanelContext } from './PanelContext'
import { EventType } from '../Context'
import { Drawing } from './Drawing'
import { MathUtil } from '../../internal/MathUtil'
import { ChartMarker } from '../drawer/ChartMarker'
import { Box } from '../../model/Box'
import { Range } from '../../model/Range'
import { Util } from '../../internal/Util'
import { GraphicElement } from '../../element/GraphicElement'

export class PanelCanvas extends GraphicElement {
  readonly drawings: Drawing[]

  constructor(
    drawers: ChartDrawer[],
    parent: Container,
    private readonly context: PanelContext
  ) {
    super('chart-panel-canvas', parent)
    this.drawings = drawers.map((drawer) => new Drawing(drawer, this.container))
    this.context.addEventListener(EventType.REPOSITION, () => this.refresh(), 100)
    this.context.addEventListener(EventType.COORDINATE_SYSTEM_UPDATE, () => this.refresh(), 100)
    this.context.addEventListener(EventType.REDRAW, () => this.refresh(), 100)
    this.refresh()
  }

  getDrawingValueRange(): Range {
    const items = this.getDrawingItems()
    return Range.max(
      this.drawings.map((drawing) => drawing.getDrawingValueRange(items)).filter((range) => !range.isEmpty())
    )
  }

  untransform(): void {
    this.container.untransform()
  }

  getChartMarker(id: number): ChartMarker {
    const result = Util.findMappedValue(this.drawings, (drawing) => drawing.findChartMarker(id))
    if (!result) {
      throw Error(`No chart marker with id ${id}`)
    }
    return result
  }

  private refresh(): void {
    this.clip(this.context.dimensions.drawArea.move(1, 1))
    this.untransform()
    const items = this.getDrawingItems()
    this.drawings.forEach((drawing) => drawing.createDrawing(items))
  }

  private getDrawingItems(): DrawingItem[] {
    return this.context.timeSeries.getAllItems().map((item) => {
      const x = this.context.toX(item.time)
      const drawAreaWidth = MathUtil.clamp(this.context.gridUnitWidth - 2, 5, 40)
      const drawArea = new Box(
        x - drawAreaWidth / 2,
        this.context.dimensions.drawArea.y,
        drawAreaWidth,
        this.context.dimensions.drawArea.height
      )
      return new DrawingItem(item, x, drawArea)
    })
  }
}
