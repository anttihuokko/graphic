import { Container, Rect } from '@svgdotjs/svg.js'
import { EventType } from '../Context'
import { ChartButton } from '../element/ChartButton'
import { ChartElement } from '../element/ChartElement'
import { PanelState } from './ChartPanel'
import { PanelContext } from './PanelContext'

export class PanelControls extends ChartElement<PanelContext> {
  private static readonly MARGIN = 8

  private static readonly SPACING = 32

  private readonly mask: Rect

  private readonly collapseToggleButton1: ChartButton

  private readonly collapseToggleButton2: ChartButton

  private readonly maximizeToggleButton: ChartButton

  private readonly infoToggleButton: ChartButton

  private currentPanelState = PanelState.DEFAULT

  private currentInfoSelected = false

  constructor(parent: Container, context: PanelContext) {
    super('chart-panel-controls', parent, context)
    this.mask = this.container.rect().addClass('mask').hide()
    this.collapseToggleButton1 = new ChartButton(
      context.symbols.angleDown,
      'chart-panel-collapse-toggle',
      this.container
    )
    this.collapseToggleButton2 = new ChartButton(context.symbols.angleUp, 'chart-panel-collapse-toggle', this.container)
    this.maximizeToggleButton = new ChartButton(context.symbols.expand, 'chart-panel-maximize-toggle', this.container)
    this.infoToggleButton = new ChartButton(context.symbols.info, 'chart-panel-info-toggle', this.container)
    this.context.addEventListener(EventType.REPOSITION, () => this.refresh())
    this.context.addEventListener(EventType.REDRAW, () => this.refresh())
    this.refresh()
  }

  get panelState(): PanelState {
    return this.currentPanelState
  }

  get infoSelected(): boolean {
    return this.currentInfoSelected
  }

  togglePanelCollapsed(): void {
    if (this.currentPanelState === PanelState.DEFAULT && this.isCollapsable()) {
      this.currentPanelState = PanelState.COLLAPSED
    } else if (this.currentPanelState === PanelState.COLLAPSED) {
      this.currentPanelState = PanelState.DEFAULT
    }
  }

  togglePanelMaximized(): void {
    if (this.currentPanelState === PanelState.DEFAULT && this.isMaximizable()) {
      this.currentPanelState = PanelState.MAXIMIZED
    } else if (this.currentPanelState === PanelState.MAXIMIZED) {
      this.currentPanelState = PanelState.DEFAULT
    }
  }

  toggleInfoSelected(): void {
    this.currentInfoSelected = !this.currentInfoSelected
    this.refresh()
  }

  private isCollapsable(): boolean {
    return this.context.chartContext.panelsMeta.openPanelCount > 1
  }

  private isMaximizable(): boolean {
    return this.context.chartContext.panelsMeta.totalPanelCount > 1
  }

  private refresh(): void {
    this.translateTo(1, 1)
    if (this.currentPanelState === PanelState.COLLAPSED) {
      this.mask
        .move(1, 1)
        .size(this.dimensions.drawAreaWidth - 2, this.dimensions.drawAreaHeight - 2)
        .show()
      this.collapseToggleButton1.hide()
      this.collapseToggleButton2.show()
      this.maximizeToggleButton.hide()
      this.infoToggleButton.hide()
    } else if (this.currentPanelState === PanelState.MAXIMIZED) {
      this.mask.hide()
      this.collapseToggleButton1.hide()
      this.collapseToggleButton2.hide()
      this.maximizeToggleButton.setVisible(this.isMaximizable()).setSelected(true)
      this.infoToggleButton.setVisible(this.context.settings.debugInfoVisible).setSelected(this.currentInfoSelected)
    } else {
      this.mask.hide()
      this.collapseToggleButton1.setVisible(this.isCollapsable())
      this.collapseToggleButton2.hide()
      this.maximizeToggleButton.setVisible(this.isMaximizable()).setSelected(false)
      this.infoToggleButton.setVisible(this.context.settings.debugInfoVisible).setSelected(this.currentInfoSelected)
    }
    this.positionButtons(
      [this.collapseToggleButton1, this.collapseToggleButton2, this.maximizeToggleButton, this.infoToggleButton],
      this.currentPanelState === PanelState.COLLAPSED ? 1 : PanelControls.MARGIN
    )
  }

  private positionButtons(buttons: ChartButton[], marginTop: number): void {
    buttons
      .filter((button) => button.visible)
      .forEach((button, index, visibleButtons) => {
        const position = visibleButtons.length - index
        button.translateTo(this.dimensions.drawAreaWidth - PanelControls.SPACING * position, marginTop)
      })
  }
}
