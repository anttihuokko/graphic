import { Container, Point } from '@svgdotjs/svg.js'
import { DataAccessor, TimeSeriesItem } from '../data/TimeSeries'
import { ChartMarker } from './ChartMarker'
import { DrawerContext } from './DrawerContext'
import { Color } from '../../model/Color'
import { Box } from '../../model/Box'
import { Range } from '../../model/Range'
import { Time } from '../../model/Time'

export class DrawingItem implements DataAccessor {
  constructor(
    private readonly timeSeriesItem: TimeSeriesItem,
    private readonly x: number,
    readonly drawArea: Box
  ) {}

  get time(): Time {
    return this.timeSeriesItem.time
  }

  hasAllValues(fields: string[]): boolean {
    return this.timeSeriesItem.hasAllValues(fields)
  }

  getX(): number {
    return this.x
  }

  getY(field: string, context: DrawerContext): number {
    return context.toY(this.getNumberValue(field))
  }

  getPoint(valueField: string, context: DrawerContext): Point {
    return new Point(this.x, this.getY(valueField, context))
  }

  getNumberValue(field: string, defaultValue: number | null = null): number {
    return this.timeSeriesItem.getNumberValue(field, defaultValue)
  }

  getStringValue(field: string, defaultValue: string | null = null): string {
    return this.timeSeriesItem.getStringValue(field, defaultValue)
  }
}

export interface LegendDef {
  readonly label: string
  readonly color1: Color
  readonly color2: Color
}

class Template {
  private readonly variableNames: string[]

  constructor(private readonly template: string) {
    this.variableNames = Array.from(template.matchAll(/{(\S+)}/g)).flatMap((match) => (match[1] ? [match[1]] : []))
  }

  resolve(accessor: DataAccessor): string {
    let result = this.template
    this.variableNames.forEach((variableName) => {
      result = result.replaceAll(`{${variableName}}`, accessor.getStringValue(variableName, '?'))
    })
    return result
  }
}

export interface ChartDrawer {
  readonly legendDef: LegendDef

  readonly requiredFields: string[]

  getContext(): DrawerContext

  setContext(context: DrawerContext): void

  isEnabled(): boolean

  getInfoText(accessor: DataAccessor): string

  getValueRange(accessors: DataAccessor[]): Range

  findChartMarker(id: number): ChartMarker | undefined

  createDrawing(items: DrawingItem[], container: Container): void
}

export abstract class BaseChartDrawer implements ChartDrawer {
  readonly legendDef: LegendDef

  private readonly infoTemplate: Template

  private context!: DrawerContext

  constructor(
    readonly name: string,
    readonly color1: Color,
    readonly color2: Color,
    readonly minValueField: string,
    readonly maxValueField: string,
    readonly requiredFields: string[],
    infoTemplate: string,
    private readonly enabled: boolean
  ) {
    this.legendDef = { label: name, color1: color1, color2: color2 }
    this.infoTemplate = new Template(infoTemplate)
  }

  toCoordinateArray(field: string, items: DrawingItem[]): number[] {
    return items.flatMap((item) => {
      const p = item.getPoint(field, this.getContext())
      return [p.x, p.y]
    })
  }

  getContext(): DrawerContext {
    if (!this.context) {
      throw Error(`Drawer context not set for drawer ${this.constructor.name}`)
    }
    return this.context
  }

  setContext(context: DrawerContext): void {
    this.context = context
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getInfoText(accessor: DataAccessor): string {
    return this.infoTemplate.resolve(accessor)
  }

  getValueRange(accessors: DataAccessor[]): Range {
    return Range.max(
      accessors.map(
        (accessor) =>
          new Range(accessor.getNumberValue(this.minValueField), accessor.getNumberValue(this.maxValueField))
      )
    )
  }

  findChartMarker(_id: number): ChartMarker | undefined {
    return undefined
  }

  abstract createDrawing(items: DrawingItem[], container: Container): void
}
