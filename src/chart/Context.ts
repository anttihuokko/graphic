import { Box } from '../model/Box'
import { Size } from '../model/Size'
import { Symbols } from '../Symbols'
import { ChartSettings } from './ChartSettings'

export class Dimensions {
  static readonly EMPTY = new Dimensions(Size.ZERO, Box.EMPTY, Size.ZERO)

  constructor(
    readonly labelSize: Size,
    readonly drawArea: Box,
    readonly viewSize: Size
  ) {}

  get viewWidth(): number {
    return this.viewSize.width
  }

  get viewHeight(): number {
    return this.viewSize.height
  }

  get drawAreaLeft(): number {
    return this.drawArea.left
  }

  get drawAreaRight(): number {
    return this.drawArea.right
  }

  get drawAreaTop(): number {
    return this.drawArea.top
  }

  get drawAreaBottom(): number {
    return this.drawArea.bottom
  }

  get drawAreaWidth(): number {
    return this.drawArea.width
  }

  get drawAreaHeight(): number {
    return this.drawArea.height
  }

  get marginLeft(): number {
    return this.drawAreaLeft
  }

  get marginTop(): number {
    return this.drawAreaTop
  }

  get marginRight(): number {
    return this.viewWidth - this.drawAreaRight
  }

  get marginBottom(): number {
    return this.viewHeight - this.drawAreaBottom
  }

  get labelWidth(): number {
    return this.labelSize.width
  }

  get labelHeight(): number {
    return this.labelSize.height
  }
}

export enum EventType {
  REPOSITION,
  COORDINATE_SYSTEM_UPDATE,
  REDRAW,
  VIEW_OFFSET,
  HIGHLIGHT_CHANGE,
  TIME_SERIES_DATA_LOAD_START,
  TIME_SERIES_DATA_LOAD_STOP,
  TIME_SERIES_DATA_UPDATE,
  SETTINGS_UPDATE,
}

export type DebugInfo = { key: string; value: string | number | object }[]

interface EventListener {
  eventType: EventType
  callback: () => void
}

export abstract class Context {
  private readonly eventListeners: EventListener[] = []

  constructor(readonly symbols: Symbols) {}

  abstract get settings(): ChartSettings

  abstract get dimensions(): Dimensions

  addEventListener(eventType: EventType, callback: () => void): void {
    this.eventListeners.push({ eventType, callback })
  }

  fireEvent(eventType: EventType): void {
    this.eventListeners.forEach((listener) => {
      if (listener.eventType === eventType) {
        listener.callback()
      }
    })
  }
}
