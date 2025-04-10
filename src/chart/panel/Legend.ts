import { Container, Text } from '@svgdotjs/svg.js'
import { GraphicClickEvent } from '../../GraphicEvent'
import { EventType } from '../Context'
import { ChartElement } from '../element/ChartElement'
import { ChartFrame } from '../element/ChartFrame'
import { Drawing } from './Drawing'
import { PanelContext } from './PanelContext'
import { Box } from '../../model/Box'
import { Time } from '../../model/Time'

class LegendItem extends ChartFrame {
  private static readonly MARGIN1 = 5

  private static readonly MARGIN2 = 8

  private static readonly COLOR_BOX_SIZE = 14

  private readonly itemName: Text

  private readonly itemInfo: Text

  constructor(
    private offset: number,
    private readonly drawing: Drawing,
    parent: Container,
    context: PanelContext
  ) {
    super('chart-legend-item', 'chart-legend-item-frame', parent, context)
    const def = drawing.legendDef
    this.container
      .polygon([0, 0, LegendItem.COLOR_BOX_SIZE, 0, 0, LegendItem.COLOR_BOX_SIZE])
      .move(LegendItem.MARGIN1, LegendItem.MARGIN1)
      .fill(def.color1.value)
    this.container
      .polygon([
        LegendItem.COLOR_BOX_SIZE,
        0,
        LegendItem.COLOR_BOX_SIZE,
        LegendItem.COLOR_BOX_SIZE,
        0,
        LegendItem.COLOR_BOX_SIZE,
      ])
      .move(LegendItem.MARGIN1, LegendItem.MARGIN1)
      .fill(def.color2.value)
    this.itemName = this.container
      .text(def.label)
      .addClass('chart-legend-item-name')
      .move(LegendItem.COLOR_BOX_SIZE + LegendItem.MARGIN2, LegendItem.MARGIN1)
    this.itemInfo = this.container.text('').addClass('chart-legend-item-info')
    this.context.addEventListener(EventType.REDRAW, () => this.handleRedraw())
    this.handleRedraw()
  }

  isEnabled(): boolean {
    return this.drawing.enabled
  }

  isDisabled(): boolean {
    return this.container.hasClass('disabled')
  }

  toggleDisabled(): void {
    this.container.toggleClass('disabled')
    this.drawing.setVisible(!this.isDisabled())
  }

  updateInfo(time: Time | null): void {
    if (time) {
      this.itemInfo.text(this.drawing.getInfoText(time))
    } else {
      this.itemInfo.text('')
    }
    this.refresh()
  }

  updateOffset(offset: number): void {
    this.offset = offset
    this.refresh()
  }

  protected positionElements(): Box {
    if (this.itemName) {
      const itemNameBounds = this.itemName.bbox()
      this.itemInfo.move(itemNameBounds.x2 + LegendItem.MARGIN2, LegendItem.MARGIN1 + 1)
      const itemInfoBounds = this.itemInfo.bbox()
      const width =
        itemNameBounds.x2 + LegendItem.MARGIN2 + (itemInfoBounds.width ? itemInfoBounds.width + LegendItem.MARGIN2 : 0)
      const height = itemNameBounds.height + LegendItem.MARGIN1 * 2
      const spacing = this.offset * height
      return new Box(8, 8 + spacing, width, height)
    }
    return Box.EMPTY
  }

  private handleRedraw(): void {
    this.setVisible(this.isEnabled())
  }
}

export class Legend extends ChartElement<PanelContext> {
  private readonly itemContainer: Container

  private readonly label: Text

  private readonly items: LegendItem[] = []

  private minimized = false

  constructor(drawings: Drawing[], parent: Container, context: PanelContext) {
    super('chart-legend', parent, context)
    this.itemContainer = this.container.group()
    this.label = this.container.text(drawings.length ? drawings[0].legendDef.label : '').move(10, 6)
    drawings.forEach((drawing) => this.addLegendItem(drawing))
    this.context.addEventListener(EventType.HIGHLIGHT_CHANGE, () => this.handleHighlightChange())
    this.context.addEventListener(EventType.REDRAW, () => this.refresh())
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
        const enabledItemCount = this.items.reduce((acc, item) => (!item.isDisabled() ? acc + 1 : acc), 0)
        if (enabledItemCount > 1) {
          targetItem.toggleDisabled()
        }
      }
    }
  }

  private handleHighlightChange(): void {
    this.items.forEach((item) => item.updateInfo(this.context.highlightTime))
  }

  private addLegendItem(drawing: Drawing): void {
    this.items.push(new LegendItem(this.items.length, drawing, this.itemContainer, this.context))
  }

  private refresh(): void {
    if (this.minimized) {
      this.itemContainer.hide()
      this.label.show()
    } else {
      this.itemContainer.show()
      this.label.hide()
      this.items.reduce((offset, item) => {
        item.updateOffset(offset)
        return item.isEnabled() ? offset + 1 : offset
      }, 0)
    }
  }
}
