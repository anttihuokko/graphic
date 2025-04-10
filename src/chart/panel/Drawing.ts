import { Container } from '@svgdotjs/svg.js'
import { ChartDrawer, DrawingItem, LegendDef } from '../drawer/ChartDrawer'
import { ChartMarker } from '../drawer/ChartMarker'
import { Range } from '../../model/Range'
import { Time } from '../../model/Time'

export class Drawing {
  private readonly container: Container

  private infos: { time: Time; infoText: string }[] = []

  constructor(
    private readonly drawer: ChartDrawer,
    parent: Container
  ) {
    this.container = parent.group().addClass('chart-drawing')
  }

  get legendDef(): LegendDef {
    return this.drawer.legendDef
  }

  get enabled(): boolean {
    return this.drawer.isEnabled()
  }

  setVisible(visible: boolean) {
    if (visible) {
      this.container.show()
    } else {
      this.container.hide()
    }
  }

  getDrawingValueRange(items: DrawingItem[]): Range {
    if (this.isActive()) {
      return this.getValueRange(items)
    }
    return Range.EMPTY
  }

  getInfoText(time: Time): string {
    if (this.isActive()) {
      return this.infos.find((info) => +info.time === +time)?.infoText ?? ''
    }
    return ''
  }

  createDrawing(items: DrawingItem[]): void {
    this.container.clear()
    if (this.isActive()) {
      const validItems = this.getValidItems(items)
      this.infos = validItems.map((item) => {
        return {
          time: item.time,
          infoText: this.drawer.getInfoText(item),
        }
      })
      if (validItems.length) {
        this.drawer.createDrawing(validItems, this.container)
      }
    }
  }

  findChartMarker(id: number): ChartMarker | undefined {
    return this.drawer.findChartMarker(id)
  }

  private isActive(): boolean {
    return this.enabled && this.container.visible()
  }

  private getValueRange(items: DrawingItem[]): Range {
    const validItems = this.getValidItems(items)
    if (!validItems.length) {
      return Range.EMPTY
    }
    return this.drawer.getValueRange(validItems)
  }

  private getValidItems(items: DrawingItem[]): DrawingItem[] {
    return items.filter((item) => item.hasAllValues(this.drawer.requiredFields))
  }
}
