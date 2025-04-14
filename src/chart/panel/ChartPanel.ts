import { Container, Path, Rect } from '@svgdotjs/svg.js'
import { YAxel } from '../axel/YAxel'
import { ChartContext } from '../ChartContext'
import { ChartElement } from '../element/ChartElement'
import { PanelCanvas } from './PanelCanvas'
import { InfoPanel } from './InfoPanel'
import { PanelContext } from './PanelContext'
import { ChartDrawer } from '../drawer/ChartDrawer'
import { DebugInfo, EventType } from '../Context'
import { GraphicClickEvent, GraphicDoubleClickEvent, GraphicEvent } from '../../GraphicEvent'
import { HighlightValue } from '../HighlightManager'
import { PanelControls } from './PanelControls'
import { Legend } from './Legend'
import { ChartMarker } from '../drawer/ChartMarker'
import { DrawerContext } from '../drawer/DrawerContext'
import { DataLoadingIndicator } from './DataLoadingIndicator'
import { Offset } from '../../model/Offset'

class ChartPanelFrame extends ChartElement<PanelContext> {
  private readonly bg: Rect

  private readonly border: Path

  constructor(parent: Container, context: PanelContext) {
    super('chart-panel-frame', parent, context)
    this.bg = this.container.rect().addClass('chart-panel-frame-bg').addClass('interactive')
    this.border = this.container.path()
    this.context.addEventListener(EventType.REPOSITION, () => this.refresh())
    this.context.addEventListener(EventType.REDRAW, () => this.refresh())
    this.refresh()
  }

  private refresh(): void {
    this.translateTo(1, 1)
    this.bg.move(1, 1).size(this.dimensions.drawAreaWidth - 2, this.dimensions.drawAreaHeight - 2)
    this.border.plot(`
      ${this.context.firstPanel ? `M 0 0 H ${this.dimensions.drawAreaWidth}` : ''}
      M 0 ${this.dimensions.drawAreaHeight} H ${this.dimensions.drawAreaWidth + 44}
      M 0 0 V ${this.dimensions.drawAreaHeight}
      M ${this.dimensions.drawAreaRight - 1} 0 V ${this.dimensions.drawAreaHeight + (this.context.lastPanel ? 24 : 0)}
    `)
  }
}

export enum PanelState {
  DEFAULT,
  COLLAPSED,
  MAXIMIZED,
}

export class ChartPanel extends ChartElement<ChartContext> {
  static readonly COLLAPSED_HEIGHT = 26

  static readonly PANEL_SIZE_RATIOS: { [key: number]: number[] } = {
    1: [1.0],
    2: [0.65, 0.35],
    3: [0.5, 0.25, 0.25],
    4: [0.4, 0.2, 0.2, 0.2],
    5: [0.34, 0.165, 0.165, 0.165, 0.165],
    6: [0.3, 0.14, 0.14, 0.14, 0.14, 0.14],
  }

  private readonly panelContext: PanelContext

  private readonly yAxel: YAxel

  private readonly frame: ChartPanelFrame

  private readonly canvas: PanelCanvas

  private readonly infoPanel: InfoPanel

  private readonly controls: PanelControls

  private readonly legend: Legend

  private readonly dataLoadingIndicator: DataLoadingIndicator

  private focused = true

  private focusedChartMarker: ChartMarker | null = null

  constructor(drawers: ChartDrawer[], parent: Container, context: ChartContext) {
    super('chart-panel', parent, context)
    this.panelContext = new PanelContext(
      (value) => this.yAxel.toPixel(value),
      () => this.createDebugInfo(),
      this.context
    )
    this.yAxel = new YAxel(this.container, this.panelContext)
    this.frame = new ChartPanelFrame(this.container, this.panelContext)
    this.canvas = new PanelCanvas(this.withDrawerContextsSet(drawers), this.container, this.panelContext)
    this.infoPanel = new InfoPanel(this.container, this.panelContext).hide()
    this.controls = new PanelControls(this.container, this.panelContext)
    this.legend = new Legend(this.canvas.drawings, this.container, this.panelContext)
    this.dataLoadingIndicator = new DataLoadingIndicator(this.container, this.panelContext)
    this.context.addEventListener(EventType.COORDINATE_SYSTEM_UPDATE, () => this.handleCoordinateSystemUpdate())
    this.context.addEventListener(EventType.HIGHLIGHT_CHANGE, () =>
      this.panelContext.fireEvent(EventType.HIGHLIGHT_CHANGE)
    )
    this.context.addEventListener(EventType.TIME_SERIES_DATA_LOAD_START, () =>
      this.dataLoadingIndicator.showIndicator()
    )
    this.context.addEventListener(EventType.TIME_SERIES_DATA_LOAD_STOP, () => this.dataLoadingIndicator.hideIndicator())
    this.context.addEventListener(EventType.TIME_SERIES_DATA_UPDATE, () => this.handleRedraw())
    this.context.addEventListener(EventType.REDRAW, () => this.handleRedraw())
    this.refresh()
  }

  get id(): string {
    return this.panelContext.panelId
  }

  get panelState(): PanelState {
    return this.controls.panelState
  }

  isCollapsed(): boolean {
    return this.panelState === PanelState.COLLAPSED
  }

  isMaximized(): boolean {
    return this.panelState === PanelState.MAXIMIZED
  }

  isEventTarget(event: GraphicEvent): boolean {
    return event.hasTargetElementParent(this.container)
  }

  toHighlightValue(event: GraphicEvent): HighlightValue {
    return this.yAxel.toHighlightValue(event)
  }

  updateFocused(event: GraphicEvent): void {
    this.focused = this.isEventTarget(event)
    if (this.focused) {
      this.container.addClass('focused')
    } else {
      this.setFocusedChartMarker(null)
      this.container.removeClass('focused')
    }
  }

  update(visible: boolean, top: number, height: number): void {
    if (visible) {
      this.container.show()
      this.panelContext.updateDimensions(
        this.dimensions.drawAreaTop === top,
        this.dimensions.drawAreaBottom === top + height,
        top,
        height
      )
      this.handleReposition()
    } else {
      this.container.hide()
    }
  }

  offset(offset: Offset): void {
    if (this.focused) {
      this.canvas.translate(offset.x, offset.y)
      this.yAxel.offset(offset.y)
    } else {
      this.canvas.translate(offset.x, 0)
    }
    this.panelContext.setViewOffset(this.canvas.elementOffset)
    this.panelContext.fireEvent(EventType.VIEW_OFFSET)
  }

  zoom(amount: number): void {
    const value = this.yAxel.getVisibleRange().middle
    this.yAxel.zoom(amount, () => {
      this.yAxel.moveCenterToValue(value)
      this.handleCoordinateSystemUpdate()
    })
  }

  handleClickEvent(event: GraphicClickEvent): void {
    if (event.hasTargetElementClass('chart-panel-collapse-toggle')) {
      this.toggleCollapsed()
    } else if (event.hasTargetElementClass('chart-panel-maximize-toggle')) {
      this.toggleMaximized()
    } else if (event.hasTargetElementClass('chart-panel-info-toggle')) {
      this.toggleInfoVisible()
    } else if (event.hasTargetElementClass('chart-legend-item-frame')) {
      this.legend.handleClick(event)
      this.panelContext.fireEvent(EventType.REDRAW)
    } else if (event.hasTargetElementClass('chart-marker')) {
      const markerId = +(event.targetElement?.id() ?? -1)
      const marker = this.canvas.getChartMarker(markerId)
      this.setFocusedChartMarker(marker)
      marker.handleClickEvent(event)
    } else {
      this.setFocusedChartMarker(null)
    }
  }

  handleDoubleClickEvent(_event: GraphicDoubleClickEvent): void {
    this.toggleMaximized()
  }

  delete(): void {
    this.container.remove()
  }

  private withDrawerContextsSet(drawers: ChartDrawer[]): ChartDrawer[] {
    const drawerContext = new DrawerContext(() => this.handleRedraw(), this.panelContext)
    drawers.forEach((drawer) => drawer.setContext(drawerContext))
    return drawers
  }

  private toggleCollapsed(): void {
    this.controls.togglePanelCollapsed()
    this.yAxel.setVisible(!this.isCollapsed())
    this.canvas.setVisible(!this.isCollapsed())
    this.infoPanel.setVisible(this.controls.infoSelected && !this.isCollapsed())
    this.legend.setMinimized(this.isCollapsed())
  }

  private toggleMaximized(): void {
    this.controls.togglePanelMaximized()
  }

  private toggleInfoVisible() {
    this.controls.toggleInfoSelected()
    this.infoPanel.setVisible(this.controls.infoSelected)
  }

  private fitYAxel(force: boolean): void {
    this.yAxel.fitValueRange(force, this.panelContext.drawValueRange, () => {
      this.refresh()
    })
  }

  private refresh(): void {
    this.panelContext.setDrawValueRange(this.canvas.getDrawingValueRange())
    this.canvas.untransform()
    this.panelContext.setViewOffset(Offset.ZERO)
    this.translateTo(0, this.panelContext.dimensions.drawAreaTop - 1)
    if (this.isCollapsed()) {
      this.container.addClass('collapsed')
    } else {
      this.container.removeClass('collapsed')
    }
    if (this.isMaximized()) {
      this.container.addClass('maximized')
    } else {
      this.container.removeClass('maximized')
    }
  }

  private handleReposition(): void {
    this.refresh()
    this.fitYAxel(true)
    this.panelContext.fireEvent(EventType.REPOSITION)
  }

  private handleCoordinateSystemUpdate(): void {
    this.refresh()
    this.panelContext.fireEvent(EventType.COORDINATE_SYSTEM_UPDATE)
  }

  private handleRedraw(): void {
    this.refresh()
    this.fitYAxel(false)
    this.panelContext.fireEvent(EventType.REDRAW)
  }

  private setFocusedChartMarker(marker: ChartMarker | null): void {
    this.focusedChartMarker?.setFocused(false)
    this.focusedChartMarker = marker
    this.focusedChartMarker?.setFocused(true)
  }

  private createDebugInfo(): DebugInfo {
    return [{ key: 'VIS-Y', value: this.yAxel.getVisibleRange() }]
  }
}
