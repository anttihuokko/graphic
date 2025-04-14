import { Svg } from '@svgdotjs/svg.js'
import { GraphicEventName } from '../GraphicEvent'

export class EventTarget {
  constructor(private readonly svg: Svg) {}

  on(event: string, cb: EventListener): void {
    this.svg.on(event, cb)
  }

  off(event: string | Event[], cb?: EventListener): void {
    this.svg.off(event, cb)
  }

  fire<T>(event: GraphicEventName, data?: T): void {
    this.svg.fire(event, data)
  }
}
