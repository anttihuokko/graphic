import { Container } from '@svgdotjs/svg.js'
import { DataAccessor } from '../data/TimeSeries'
import { ChartDrawer, DrawingItem, LegendDef } from './ChartDrawer'
import { ChartMarker } from './ChartMarker'
import { DrawerContext } from './DrawerContext'
import { Range } from '../../model/Range'
import { Util } from '../../internal/Util'

export class GroupDrawer implements ChartDrawer {
  private readonly drawers: ChartDrawer[]

  constructor(
    private readonly masterDrawerIndex: number,
    drawers: ChartDrawer[],
    private readonly enabled: boolean = true
  ) {
    if (!drawers.length) {
      throw Error('Group darwer must have at least one drawer')
    }
    if (masterDrawerIndex >= drawers.length) {
      throw Error(`No drawer for masterDrawerIndex ${masterDrawerIndex}`)
    }
    this.drawers = drawers
  }

  get legendDef(): LegendDef {
    return this.drawers[this.masterDrawerIndex].legendDef
  }

  get requiredFields(): string[] {
    return this.drawers.flatMap((drawer) => drawer.requiredFields)
  }

  getContext(): DrawerContext {
    return this.drawers[this.masterDrawerIndex].getContext()
  }

  setContext(context: DrawerContext): void {
    this.drawers.forEach((drawer) => drawer.setContext(context))
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getInfoText(accessor: DataAccessor): string {
    return this.drawers[this.masterDrawerIndex].getInfoText(accessor)
  }

  getValueRange(accessors: DataAccessor[]): Range {
    return Range.max(this.drawers.map((drawer) => drawer.getValueRange(accessors)))
  }

  findChartMarker(id: number): ChartMarker | undefined {
    return Util.findMappedValue(this.drawers, (drawer) => drawer.findChartMarker(id))
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    this.drawers.forEach((drawer) => drawer.createDrawing(items, container))
  }
}
