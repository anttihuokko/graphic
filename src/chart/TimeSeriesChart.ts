import { throttle } from 'lodash'
import { G } from '@svgdotjs/svg.js'
import {
  GraphicClickEvent,
  GraphicDoubleClickEvent,
  GraphicDragEvent,
  GraphicEvent,
  GraphicHoverEvent,
  GraphicWheelEvent,
} from '../GraphicEvent'
import { XAxel } from './axel/XAxel'
import { Chart } from './Chart'
import { HighlightManager } from './HighlightManager'
import { TimeSeriesDataSource } from './data/TimeSeriesDataSource'
import { TimeSeriesDataProvider } from './data/TimeSeriesDataProvider'
import { ChartDrawer } from './drawer/ChartDrawer'
import { ChartPanel } from './panel/ChartPanel'
import { DebugInfo, EventType } from './Context'
import { TimeSeriesDataQuery } from './data/TimeSeriesDataQuery'
import { Time, Duration } from '../model/Time'
import { TimeSeries } from './data/TimeSeries'
import { GapVisualizer } from './GapVisualizer'
import { Interval } from '../model/Interval'
import { ChartSettings, DEFAULT_CHART_SETTINGS } from './ChartSettings'

export class TimeSeriesChart extends Chart {
  private readonly handleHoverEventThrottled = throttle(this.handleHoverEvent, 50)

  private readonly zoomXAxelThrottled = throttle(this.zoomXAxel, 50)

  private readonly xAxel: XAxel

  private readonly gapVisualizer: GapVisualizer

  private readonly panelContainer: G

  private readonly highlightManager: HighlightManager

  private readonly panels: ChartPanel[] = []

  private dataProvider: TimeSeriesDataProvider

  constructor(container: HTMLElement, timeUnitDuration: Duration, dataSource: TimeSeriesDataSource) {
    super(DEFAULT_CHART_SETTINGS, container)
    this.dataProvider = this.createTimeSeriesDataProvider(dataSource)
    this.xAxel = new XAxel(this.svg, this.context)
    this.gapVisualizer = new GapVisualizer(this.svg, this.context).hide()
    this.panelContainer = this.svg.group().addClass('chart-panels')
    this.highlightManager = new HighlightManager(this.svg, this.context)
    this.listen('gresize', () => this.handleResizeEvent())
    this.listen('gdrag', (event: GraphicDragEvent) => this.handleDragEvent(event))
    this.listen('ghover', (event: GraphicHoverEvent) => this.handleHoverEventThrottled(event))
    this.listen('gwheel', (event: GraphicWheelEvent) => this.handleWheelEvent(event))
    this.listen('gclick', (event: GraphicClickEvent) => this.handleClickEvent(event))
    this.listen('gdoubleclick', (event: GraphicDoubleClickEvent) => this.handleDoubleClickEvent(event))
    this.setTimeUnitDuration(timeUnitDuration)
    this.setDataSource(dataSource)
    this.refresh()
  }

  getVisibleStartTime(): Time {
    return this.xAxel.getVisibleStartTime()
  }

  getVisibleMiddleTime(): Time {
    return this.xAxel.getVisibleMiddleTime()
  }

  getVisibleEndTime(): Time {
    return this.xAxel.getVisibleEndTime()
  }

  updateSettings(settings: ChartSettings): void {
    this.context.updateSettings(settings)
    this.context.fireEvent(EventType.SETTINGS_UPDATE)
    this.refresh()
  }

  moveStartToTime(time: Time): void {
    this.xAxel.moveStartToTime(time)
    this.refresh()
  }

  moveCenterToTime(time: Time): void {
    this.xAxel.moveCenterToTime(time)
    this.refresh()
  }

  moveEndToTime(time: Time): void {
    this.xAxel.moveEndToTime(time)
    this.refresh()
  }

  setTimeUnitDuration(duration: Duration): void {
    this.context.setTimeUnitDuration(duration)
    this.xAxel.resetTimeUnit()
  }

  setDataSource(dataSource: TimeSeriesDataSource): void {
    this.dataProvider = this.createTimeSeriesDataProvider(dataSource)
  }

  addPanel(drawers: ChartDrawer[]): void {
    if (this.panels.length + 1 > Object.keys(ChartPanel.PANEL_SIZE_RATIOS).length) {
      throw Error('Maximum number of chart panels reached')
    }
    this.panels.push(new ChartPanel(drawers, this.panelContainer, this.context))
    this.refresh()
  }

  removeAllPanels(): void {
    this.panels.forEach((panel) => panel.delete())
    this.panels.length = 0
    this.refresh()
  }

  redraw(): void {
    this.context.fireEvent(EventType.REDRAW)
  }

  reset(): void {
    this.refresh(true)
  }

  protected toPixel(value: Time): number {
    return this.xAxel.toPixel(value)
  }

  protected createDebugInfo(): DebugInfo {
    return [
      {
        key: 'VIS-X',
        value: new Interval(this.xAxel.getVisibleStartTime(), this.xAxel.getVisibleEndTime()).format(
          'HH:mm dd.MM.yyyy'
        ),
      },
      { key: 'CACHE', value: this.dataProvider.getCachedInterval().format('HH:mm dd.MM.yyyy') },
      { key: 'TS', value: this.context.timeSeries.interval.format('HH:mm dd.MM.yyyy') },
    ]
  }

  private createTimeSeriesDataProvider(dataSource: TimeSeriesDataSource) {
    this.dataProvider?.closeProvider()
    return new TimeSeriesDataProvider(
      dataSource,
      (_requestId: string, _time: Time) => this.context.fireEvent(EventType.TIME_SERIES_DATA_LOAD_START),
      (_requestId: string, _time: Time) => this.context.fireEvent(EventType.TIME_SERIES_DATA_LOAD_STOP)
    )
  }

  private refresh(forceDataReset: boolean = false): void {
    this.context.updateDimensions(this.size)
    if (this.panels.length) {
      this.refreshPanels()
    }
    this.gapVisualizer.refresh()
    this.updateDataIfNeeded(forceDataReset)
  }

  private refreshPanels(): void {
    this.context.updatePanelsMeta(
      this.panels.reduce((sum, panel) => {
        return panel.isCollapsed() ? sum : sum + 1
      }, 0),
      this.panels.length
    )
    if (this.panels.find((panel) => panel.isMaximized())) {
      this.panels.forEach((panel) => {
        if (panel.isMaximized()) {
          panel.update(true, this.context.dimensions.marginTop, this.context.dimensions.drawAreaHeight)
        } else {
          panel.update(false, 0, 0)
        }
      })
    } else {
      const openPanelsCount = this.panels.filter((panel) => !panel.isCollapsed()).length
      const availableOpenPanelHeight =
        this.context.dimensions.drawAreaHeight - ChartPanel.COLLAPSED_HEIGHT * (this.panels.length - openPanelsCount)
      const panelSizeRatios = ChartPanel.PANEL_SIZE_RATIOS[openPanelsCount] ?? []
      const nextTop = this.panels
        .filter((panel) => !panel.isCollapsed())
        .reduce((top, panel, index) => {
          const height = availableOpenPanelHeight * (panelSizeRatios[index] ?? 0.5)
          panel.update(true, top, height)
          return top + height
        }, this.context.dimensions.marginTop)
      this.panels
        .filter((panel) => panel.isCollapsed())
        .reduce((top, panel) => {
          panel.update(true, top, ChartPanel.COLLAPSED_HEIGHT)
          return top + ChartPanel.COLLAPSED_HEIGHT
        }, nextTop)
    }
  }

  private async updateDataIfNeeded(forceDataReset: boolean = false): Promise<void> {
    if (forceDataReset) {
      this.context.clearTimeSeries()
    }
    const section = this.xAxel.getVisibleTimeSeriesSection()
    if (this.context.timeSeries.hasFullItemSection(section.expandBy(1.2))) {
      return
    }
    const query = new TimeSeriesDataQuery(this.context.timeUnitDuration, section.expandBy(1.8))
    const slice = await this.dataProvider.loadData(query, forceDataReset)
    if (!slice || slice.isEmpty()) {
      return
    }
    if (this.context.timeSeries.interval.isSame(slice.interval)) {
      return
    }
    if (!this.context.timeSeries.isEmpty()) {
      if (
        slice.containsFullDataStart &&
        this.context.timeSeries.containsFullDataStart &&
        slice.interval.start === this.context.timeSeries.interval.start &&
        slice.getItemCount() <= this.context.timeSeries.getItemCount()
      ) {
        return
      }
      if (
        slice.containsFullDataEnd &&
        this.context.timeSeries.containsFullDataEnd &&
        slice.interval.end === this.context.timeSeries.interval.end &&
        slice.getItemCount() <= this.context.timeSeries.getItemCount()
      ) {
        return
      }
    }
    this.context.setTimeSeries(TimeSeries.createForSlice(slice))
    this.context.fireEvent(EventType.TIME_SERIES_DATA_UPDATE)
  }

  private handleResizeEvent(): void {
    this.refresh()
    this.xAxel.reposition()
  }

  private handleDragEvent(event: GraphicDragEvent): void {
    this.updateFocusedPanel(event)
    if (event.hasTargetElementClass('chart-panel-frame-bg')) {
      this.xAxel.offset(event.delta.x)
      this.gapVisualizer.offset(event.delta.x)
      this.panels.forEach((panel) => panel.offset(event.delta))
      this.updateDataIfNeeded()
    } else if (event.hasTargetElementClass('chart-xaxel-grab-area')) {
      this.zoomXAxelThrottled(event.delta.x)
    } else if (event.hasTargetElementClass('chart-yaxel-grab-area')) {
      const panelId = event.targetElement?.data('panel-id') as string
      const targetPanel = this.panels.find((panel) => panel.id === panelId)
      targetPanel?.zoom(event.delta.y)
    }
  }

  private handleHoverEvent(event: GraphicHoverEvent): void {
    const targetPanel = this.getTargetPanel(event)
    if (targetPanel && event.ctrlKey) {
      this.highlightManager.setHighlight(this.xAxel.toHighlightValue(event), targetPanel.toHighlightValue(event))
    } else {
      this.highlightManager.clearHighlight()
    }
  }

  private handleWheelEvent(event: GraphicWheelEvent): void {
    this.zoomXAxelThrottled(event.delta)
  }

  private handleClickEvent(event: GraphicClickEvent): void {
    this.updateFocusedPanel(event)
    this.performTargetPanelOperation(event, (panel) => panel.handleClickEvent(event))
  }

  private handleDoubleClickEvent(event: GraphicDoubleClickEvent): void {
    this.performTargetPanelOperation(event, (panel) => panel.handleDoubleClickEvent(event))
  }

  private zoomXAxel(amount: number): void {
    const time = this.xAxel.getVisibleMiddleTime()
    this.xAxel.zoom(amount, () => {
      this.xAxel.moveCenterToTime(time)
      this.context.fireEvent(EventType.COORDINATE_SYSTEM_UPDATE)
      this.updateDataIfNeeded()
    })
  }

  private performTargetPanelOperation(event: GraphicEvent, operation: (panel: ChartPanel) => void): void {
    const targetPanel = this.getTargetPanel(event)
    if (targetPanel) {
      const oldPanelState = targetPanel.panelState
      operation(targetPanel)
      if (targetPanel.panelState !== oldPanelState) {
        this.refreshPanels()
      }
    }
  }

  private getTargetPanel(event: GraphicEvent): ChartPanel | null {
    return this.panels.find((panel) => panel.isEventTarget(event)) ?? null
  }

  private updateFocusedPanel(event: GraphicEvent): void {
    this.panels.forEach((panel) => panel.updateFocused(event))
  }
}
