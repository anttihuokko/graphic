import { Container, Point, Shape } from '@svgdotjs/svg.js'
import { GraphicClickEvent } from '../../GraphicEvent'
import { ArrayUtil } from '../../internal/ArrayUtil'
import { DataAccessor, TimeSeriesItem, toTimeSeriesItems } from '../data/TimeSeries'
import { ChartDrawer, DrawingItem, LegendDef } from './ChartDrawer'
import { ChartMarker, MarkerClickCallback } from './ChartMarker'
import { DrawerContext } from './DrawerContext'
import { PathUtil } from './PathUtil'
import { Color } from '../../model/Color'
import { Size } from '../../model/Size'
import { Box } from '../../model/Box'
import { Range } from '../../model/Range'
import { Time } from '../../model/Time'
import { Interval } from '../../model/Interval'

export enum Direction {
  UP = 0,
  RIGHT = 90,
  DOWN = 180,
  LEFT = -90,
}

export class ChartPoint {
  constructor(
    readonly time: Time,
    readonly value: number
  ) {}
}

export class ChartPolyline {
  constructor(readonly points: ChartPoint[]) {}
}

class CustomDataChartDrawer {
  constructor(
    private readonly items: TimeSeriesItem[],
    private readonly drawer: ChartDrawer
  ) {}

  getInfoText(time: Time): string | null {
    const item = this.items.find((item) => item.time.equals(time))
    return item ? this.drawer.getInfoText(item) : null
  }

  getValueRange(interval: Interval): Range {
    if (this.containsAnyItem(interval) || (this.hasAnyItemBefore(interval) && this.hasAnyItemAfter(interval))) {
      return this.drawer.getValueRange(this.items)
    }
    return Range.EMPTY
  }

  createDrawing(drawAreaSize: Size, container: Container, context: DrawerContext): void {
    this.drawer.setContext(context)
    this.drawer.createDrawing(
      this.items.map((item) => {
        const x = context.toX(item.time)
        const drawArea = new Box(
          x - drawAreaSize.width / 2,
          context.dimensions.drawArea.y,
          drawAreaSize.width,
          drawAreaSize.height
        )
        return new DrawingItem(item, x, drawArea)
      }),
      container
    )
  }

  private containsAnyItem(interval: Interval): boolean {
    return this.items.some((item) => interval.contains(item.time))
  }

  private hasAnyItemBefore(interval: Interval): boolean {
    return this.items.some((item) => item.time < interval.start)
  }

  private hasAnyItemAfter(interval: Interval): boolean {
    return this.items.some((item) => item.time > interval.end)
  }
}

interface CustomChartShape {
  getValueRange(interval: Interval): Range

  createShape(container: Container, context: DrawerContext): void
}

abstract class CustomChartPathShape implements CustomChartShape {
  constructor(
    private readonly strokeColor: Color | null,
    private readonly fillColor: Color | null
  ) {}

  abstract getValueRange(interval: Interval): Range

  createShape(container: Container, context: DrawerContext): void {
    const path = container.path(PathUtil.trimPathDef(this.createPathDef(context)))
    if (this.strokeColor) {
      path.stroke(this.strokeColor.value)
    }
    if (this.fillColor) {
      path.fill(this.fillColor.value)
    } else {
      path.fill('none')
    }
  }

  abstract createPathDef(context: DrawerContext): string
}

class HorizontalLines extends CustomChartPathShape {
  constructor(
    color: Color,
    private readonly values: number[]
  ) {
    super(color, null)
  }

  getValueRange(_interval: Interval): Range {
    return Range.forValues(this.values)
  }

  createPathDef(context: DrawerContext): string {
    return this.values.reduce((acc, value) => {
      const y = context.toY(value)
      return acc + PathUtil.getLinePathDef(PathUtil.MIN_SAFE_COORDINATE, y, PathUtil.MAX_SAFE_COORDINATE, y)
    }, '')
  }
}

class Polylines extends CustomChartPathShape {
  constructor(
    color: Color,
    private readonly lines: ChartPolyline[]
  ) {
    super(color, null)
  }

  getValueRange(interval: Interval): Range {
    return Range.max(
      this.lines.flatMap((line) => {
        if (
          this.containsAnyPoint(line, interval) ||
          (this.hasAnyPointBefore(line, interval) && this.hasAnyPointAfter(line, interval))
        ) {
          return [Range.forValues(line.points.map((point) => point.value))]
        }
        return []
      })
    )
  }

  createPathDef(context: DrawerContext): string {
    return this.lines.reduce((acc, line) => {
      return acc + this.createPolylinePathDef(line, context)
    }, '')
  }

  private containsAnyPoint(line: ChartPolyline, interval: Interval): boolean {
    return line.points.some((point) => interval.contains(point.time))
  }

  private hasAnyPointBefore(line: ChartPolyline, interval: Interval): boolean {
    return line.points.some((point) => point.time < interval.start)
  }

  private hasAnyPointAfter(line: ChartPolyline, interval: Interval): boolean {
    return line.points.some((point) => point.time > interval.end)
  }

  private createPolylinePathDef(line: ChartPolyline, context: DrawerContext): string {
    const points = line.points.map((point) => new Point(context.toX(point.time), context.toY(point.value)))
    return PathUtil.getPolylinePathDef(points)
  }
}

abstract class PositionMarker implements CustomChartShape, ChartMarker {
  private static markerIdSequence = 0

  readonly markerId = ++PositionMarker.markerIdSequence

  private markerShape: Shape | null = null

  private focused = false

  constructor(
    private readonly color: Color,
    private readonly point: ChartPoint,
    private readonly onClick?: MarkerClickCallback
  ) {}

  setFocused(focused: boolean): void {
    this.focused = focused
    if (this.markerShape) {
      this.setFocusedState(this.markerShape)
    }
  }

  handleClickEvent(_event: GraphicClickEvent): void {
    if (this.onClick) {
      this.onClick(this.point.time, this.point.value)
    }
  }

  getValueRange(interval: Interval): Range {
    if (interval.contains(this.point.time)) {
      return new Range(this.point.value - 1, this.point.value + 1)
    }
    return Range.EMPTY
  }

  createShape(container: Container, context: DrawerContext): void {
    this.markerShape = this.createMarkerShape(context.toX(this.point.time), context.toY(this.point.value), container)
      .fill(this.color.value)
      .addClass('chart-marker')
      .addClass('interactive')
      .id(this.markerId.toString())
    this.setFocusedState(this.markerShape)
  }

  abstract createMarkerShape(x: number, y: number, container: Container): Shape

  private setFocusedState(shape: Shape): void {
    if (this.focused) {
      shape.addClass('focused')
    } else {
      shape.removeClass('focused')
    }
  }
}

class CircleMarker extends PositionMarker {
  private static SIZE = 12

  createMarkerShape(x: number, y: number, container: Container): Shape {
    return container.circle(CircleMarker.SIZE).center(x, y)
  }
}

class TriangleMarker extends PositionMarker {
  private static WIDTH_HALF = 8

  private static HEIGHT = 12

  constructor(
    color: Color,
    point: ChartPoint,
    private readonly direction: Direction,
    onClick?: MarkerClickCallback
  ) {
    super(color, point, onClick)
  }

  createMarkerShape(x: number, y: number, container: Container): Shape {
    return container
      .path(
        PathUtil.trimPathDef(`
      M ${x} ${y}
      l ${TriangleMarker.WIDTH_HALF} ${TriangleMarker.HEIGHT}
      h ${-TriangleMarker.WIDTH_HALF * 2}
      Z
    `)
      )
      .rotate(this.direction, x, y)
  }
}

class ArrowMarker extends PositionMarker {
  private static WIDTH_TIP_HALF = 9

  private static WIDTH_BODY_HALF = 4

  private static HEIGHT_TIP = 11

  private static HEIGHT_BODY = 12

  constructor(
    color: Color,
    point: ChartPoint,
    private readonly direction: Direction,
    onClick?: MarkerClickCallback
  ) {
    super(color, point, onClick)
  }

  createMarkerShape(x: number, y: number, container: Container): Shape {
    return container
      .path(
        PathUtil.trimPathDef(`
      M ${x} ${y}
      l ${ArrowMarker.WIDTH_TIP_HALF} ${ArrowMarker.HEIGHT_TIP}
      h ${-(ArrowMarker.WIDTH_TIP_HALF - ArrowMarker.WIDTH_BODY_HALF)}
      v ${ArrowMarker.HEIGHT_BODY}
      h ${-ArrowMarker.WIDTH_BODY_HALF * 2}
      v ${-ArrowMarker.HEIGHT_BODY}
      h ${-(ArrowMarker.WIDTH_TIP_HALF - ArrowMarker.WIDTH_BODY_HALF)}
      Z
    `)
      )
      .rotate(this.direction, x, y)
  }
}

export class CustomChartDrawer implements ChartDrawer {
  readonly requiredFields = []

  readonly legendDef: LegendDef

  private context!: DrawerContext

  private readonly drawers: CustomDataChartDrawer[] = []

  private readonly shapes: CustomChartShape[] = []

  constructor(
    name: string,
    private readonly color: Color,
    private readonly forceVisible: boolean = true,
    private enabled = true
  ) {
    this.legendDef = { label: name, color1: color, color2: color }
  }

  addDrawer(timeField: string, data: unknown[], drawer: ChartDrawer): void {
    this.drawers.push(new CustomDataChartDrawer(toTimeSeriesItems(timeField, data), drawer))
  }

  addHorizontalLines(values: number[]): void {
    this.addShape(new HorizontalLines(this.color, values))
  }

  addPolylines(lines: ChartPolyline[]): void {
    this.addShape(new Polylines(this.color, lines))
  }

  addCircleMarker(point: ChartPoint, color: Color = this.color, onClick?: MarkerClickCallback): void {
    this.addShape(new CircleMarker(color, point, onClick))
  }

  addTriangleMarker(
    point: ChartPoint,
    direction: Direction,
    color: Color = this.color,
    onClick?: MarkerClickCallback
  ): void {
    this.addShape(new TriangleMarker(color, point, direction, onClick))
  }

  addArrowMarker(
    point: ChartPoint,
    direction: Direction,
    color: Color = this.color,
    onClick?: MarkerClickCallback
  ): void {
    this.addShape(new ArrowMarker(color, point, direction, onClick))
  }

  addShape(shape: CustomChartShape): void {
    this.shapes.push(shape)
  }

  clear(): void {
    this.drawers.length = 0
    this.shapes.length = 0
  }

  redraw(): void {
    if (this.context) {
      this.context.redrawPanel()
    }
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

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  getInfoText(accessor: DataAccessor): string {
    const infoTexts = this.drawers.flatMap((drawer) => {
      const result = drawer.getInfoText(accessor.time)
      return result ? [result] : []
    })
    return infoTexts.length === 1 ? infoTexts[0] : ''
  }

  getValueRange(accessors: DataAccessor[]): Range {
    if (this.forceVisible) {
      const interval = new Interval(accessors[0].time, accessors[accessors.length - 1].time)
      const ranges = [
        ...this.drawers.map((drawer) => drawer.getValueRange(interval)),
        ...this.shapes.map((shape) => shape.getValueRange(interval)),
      ]
      return Range.max(ranges.filter((range) => !range.isEmpty()))
    }
    return Range.EMPTY
  }

  findChartMarker(id: number): ChartMarker | undefined {
    return ArrayUtil.findMappedValue(this.shapes, (shape) =>
      this.isChartMarker(shape) && shape.markerId === id ? shape : undefined
    )
  }

  createDrawing(items: DrawingItem[], container: Container): void {
    if (items.length) {
      const drawAreaSize = items[0].drawArea.getSize()
      this.drawers.forEach((drawer) => drawer.createDrawing(drawAreaSize, container, this.getContext()))
    }
    this.shapes.forEach((shape) => shape.createShape(container, this.getContext()))
  }

  private isChartMarker(obj: unknown): obj is ChartMarker {
    return !!obj && typeof obj === 'object' && 'markerId' in obj
  }
}
