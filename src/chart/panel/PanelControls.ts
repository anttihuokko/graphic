import { Container, Rect } from '@svgdotjs/svg.js'
import { EventType } from '../Context'
import { Button } from '../../element/Button'
import { PanelState } from './ChartPanel'
import { PanelContext } from './PanelContext'
import { GraphicElement } from '../../element/GraphicElement'

export class PanelControls extends GraphicElement {
  private static readonly MARGIN = 8

  private static readonly SPACING = 38

  private readonly mask: Rect

  private readonly collapseToggleButton1: Button

  private readonly collapseToggleButton2: Button

  private readonly maximizeToggleButton: Button

  private readonly infoToggleButton: Button

  private currentPanelState = PanelState.DEFAULT

  private currentInfoSelected = false

  constructor(
    parent: Container,
    private readonly context: PanelContext
  ) {
    super('chart-panel-controls', parent)
    this.mask = this.container.rect().addClass('mask').hide()
    this.collapseToggleButton1 = new Button(context.symbols.angleDown, 'chart-panel-collapse-toggle', this.container)
    this.collapseToggleButton2 = new Button(context.symbols.angleUp, 'chart-panel-collapse-toggle', this.container)
    this.maximizeToggleButton = new Button(context.symbols.expand, 'chart-panel-maximize-toggle', this.container)
    this.infoToggleButton = new Button(context.symbols.info, 'chart-panel-info-toggle', this.container)
    this.context.addEventListener(EventType.REPOSITION, () => this.refresh(), 100)
    this.context.addEventListener(EventType.REDRAW, () => this.refresh(), 100)
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
      const dimensions = this.context.dimensions
      this.mask
        .move(1, 1)
        .size(dimensions.drawAreaWidth - 2, dimensions.drawAreaHeight - 2)
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
      this.currentPanelState === PanelState.COLLAPSED ? 2 : PanelControls.MARGIN
    )
  }

  private positionButtons(buttons: Button[], marginTop: number): void {
    buttons
      .filter((button) => button.isVisible())
      .forEach((button, index, visibleButtons) => {
        const position = visibleButtons.length - index
        button.translateTo(this.context.dimensions.drawAreaWidth - PanelControls.SPACING * position, marginTop)
      })
  }
}
