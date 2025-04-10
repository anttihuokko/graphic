import { Container } from '@svgdotjs/svg.js'
import { ChartFrame, TextDef } from '../element/ChartFrame'
import { PanelContext } from './PanelContext'
import { Box } from '../../model/Box'

export class InfoPanel extends ChartFrame {
  private static readonly MARGIN_TOP = 38

  private static readonly MARGIN_LEFT = 6

  private readonly debugTexts: TextDef[]

  constructor(parent: Container, context: PanelContext) {
    super('chart-info-panel', '', parent, context)
    this.addText(context.panelId)
    this.debugTexts = context.getDebugInfo().map((item) => this.addText(this.getDebugItemText(item)))
  }

  protected positionElements(): Box {
    if (this.debugTexts) {
      this.context.getDebugInfo().forEach((item, index) => this.debugTexts[index].setText(this.getDebugItemText(item)))
    }
    return new Box(
      this.dimensions.drawAreaWidth - this.size.width - InfoPanel.MARGIN_LEFT,
      InfoPanel.MARGIN_TOP,
      300,
      100
    )
  }

  private getDebugItemText(item: { key: string; value: string | number | object }): string {
    return `${item.key}: ${item.value ? String(item.value) : '-'}`
  }
}
