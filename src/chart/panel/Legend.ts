import { Container, Text } from '@svgdotjs/svg.js'
import { GraphicClickEvent } from '../../GraphicEvent'
import { EventType } from '../Context'
import { Drawing } from './Drawing'
import { PanelContext } from './PanelContext'
import { Time } from '../../model/Time'
import { Size } from '../../model/Size'
import { ContainerFrame } from '../../element/ContainerFrame'
import { GraphicElement } from '../../element/GraphicElement'

class LegendItem extends ContainerFrame {
  private static readonly MARGIN1 = 5

  private static readonly COLOR_BOX_SIZE = 14

  private readonly itemName: Text

  private readonly itemInfo: Text

  constructor(
    private readonly drawing: Drawing,
    parent: Container
  ) {
    super('chart-legend-item', parent)
    this.setPadding(new Size(5, 5)).interactive('chart-legend-item-frame')
    this.polygon([0, 0, LegendItem.COLOR_BOX_SIZE, 0, 0, LegendItem.COLOR_BOX_SIZE]).fill(
      drawing.legendDef.color1.value
    )
    this.polygon([
      LegendItem.COLOR_BOX_SIZE,
      0,
      LegendItem.COLOR_BOX_SIZE,
      LegendItem.COLOR_BOX_SIZE,
      0,
      LegendItem.COLOR_BOX_SIZE,
    ]).fill(drawing.legendDef.color2.value)
    this.itemName = this.text(drawing.legendDef.label).addClass('chart-legend-item-name')
    this.itemInfo = this.text('').addClass('chart-legend-item-info')
    this.onFontsReady(() => this.refresh())
  }

  isDrawingEnabled(): boolean {
    return this.drawing.enabled
  }

  isDisabled(): boolean {
    return this.container.hasClass('disabled')
  }

  isActive() {
    return this.isDrawingEnabled() && !this.isDisabled()
  }

  toggleDisabled(): void {
    this.container.toggleClass('disabled')
    this.drawing.setVisible(!this.isDisabled())
  }

  updateInfoText(time: Time | null): void {
    if (time) {
      this.itemInfo.text(this.drawing.getInfoText(time))
    } else {
      this.itemInfo.text('')
    }
    this.refresh()
  }

  private refresh(): void {
    this.itemName.move(LegendItem.COLOR_BOX_SIZE + LegendItem.MARGIN1, 1)
    const itemNameBounds = this.itemName.bbox()
    this.itemInfo.move(itemNameBounds.x2 + LegendItem.MARGIN1, 1)
    this.refreshElement()
  }
}

export class Legend extends GraphicElement {
  private readonly itemContainer: Container

  private readonly label: Text

  private readonly items: LegendItem[]

  private minimized = false

  constructor(
    drawings: Drawing[],
    parent: Container,
    private readonly context: PanelContext
  ) {
    super('chart-legend', parent)
    this.itemContainer = this.container.group()
    this.label = this.container.text(drawings.length ? drawings[0].legendDef.label : '').move(10, 6)
    this.items = drawings.map((drawing) => new LegendItem(drawing, this.itemContainer))
    this.context.addEventListener(EventType.HIGHLIGHT_CHANGE, () => this.handleHighlightChange(), 100)
    this.context.addEventListener(EventType.REDRAW, () => this.refresh(), 100)
    this.refresh()
  }

  setMinimized(minimized: boolean): void {
    this.minimized = minimized
    this.refresh()
  }

  handleClick(event: GraphicClickEvent): void {
    const targetItem = this.items.find((item) => item.isEventTarget(event))
    if (targetItem) {
      if (targetItem.isDisabled()) {
        targetItem.toggleDisabled()
      } else {
        const activeItemCount = this.items.reduce((acc, item) => (item.isActive() ? acc + 1 : acc), 0)
        if (activeItemCount > 1) {
          targetItem.toggleDisabled()
        }
      }
    }
  }

  private handleHighlightChange(): void {
    this.items.forEach((item) => {
      if (item.isActive()) {
        item.updateInfoText(this.context.highlightTime)
      }
    })
  }

  private refresh(): void {
    if (this.minimized) {
      this.itemContainer.hide()
      this.label.show()
    } else {
      this.itemContainer.show()
      this.label.hide()
      let drawIndex = 0
      for (const item of this.items) {
        if (item.isDrawingEnabled()) {
          item.setVisible(true)
          item.translateTo(10, 10 + 25 * drawIndex)
          drawIndex++
        } else {
          item.setVisible(false)
        }
      }
    }
  }
}
