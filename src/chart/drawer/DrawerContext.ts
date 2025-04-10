import { Time } from '../../model/Time'
import { Dimensions } from '../Context'
import { PanelContext } from '../panel/PanelContext'

export class DrawerContext {
  constructor(
    readonly redrawPanel: () => void,
    private readonly panelContext: PanelContext
  ) {}

  get dimensions(): Dimensions {
    return this.panelContext.dimensions
  }

  toX(value: Time): number {
    return this.panelContext.toX(value)
  }

  toY(value: number): number {
    return this.panelContext.toY(value)
  }
}
