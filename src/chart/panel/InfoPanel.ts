import { Container } from '@svgdotjs/svg.js'
import { PanelContext } from './PanelContext'
import { TextDef, TextFrame } from '../../element/TextFrame'
import { Size } from '../../model/Size'
import { EventType } from '../Context'

export class InfoPanel extends TextFrame {
  private readonly debugTexts: TextDef[]

  constructor(
    parent: Container,
    private readonly context: PanelContext
  ) {
    super('chart-info-panel', parent)
    this.border(true).setPadding(new Size(8, 8)).setSize(new Size(280, 70))
    this.addText(context.panelId)
    this.debugTexts = context.getDebugInfo().map((item) => this.addText(this.getDebugItemText(item)))
    context.addEventListener(EventType.REPOSITION, () => this.refresh(), 200)
    context.addEventListener(EventType.COORDINATE_SYSTEM_UPDATE, () => this.refresh(), 200)
    context.addEventListener(EventType.REDRAW, () => this.refresh(), 200)
    context.addEventListener(EventType.VIEW_OFFSET, () => this.refresh(), 200)
  }

  setPanelVisible(visible: boolean): this {
    this.setVisible(visible)
    this.refresh()
    return this
  }

  private refresh() {
    if (this.isVisible()) {
      this.context.getDebugInfo().forEach((item, index) => this.debugTexts[index].setText(this.getDebugItemText(item)))
      this.translateTo(this.context.dimensions.drawAreaWidth - this.getSize().width - 10, 40)
      this.refreshElement()
    }
  }

  private getDebugItemText(item: { key: string; value: string | number | object }): string {
    return `${item.key}: ${item.value ? String(item.value) : '-'}`
  }
}
