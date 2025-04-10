import { ScreenLocation } from '../model/ScreenLocation'
import { MathUtil } from './MathUtil'

export class EventUtil {
  static isMouseEvent(event: Event): event is MouseEvent {
    return event.constructor.name === 'MouseEvent'
  }

  static isWheelEvent(event: Event): event is WheelEvent {
    return event.constructor.name === 'WheelEvent'
  }

  static isTouchEvent(event: Event): event is TouchEvent {
    return event.constructor.name === 'TouchEvent'
  }

  static getTargetElement(event: Event): Element | null {
    if (event.target instanceof Element) {
      return event.target
    }
    return null
  }

  static getEventLocation(event: Event): ScreenLocation | null {
    if (this.isTouchEvent(event)) {
      return this.getTouchEventLocation(event as TouchEvent)
    }
    if (this.isMouseEvent(event) || this.isWheelEvent(event)) {
      return new ScreenLocation(event.clientX, event.clientY)
    }
    return null
  }

  private static getTouchEventLocation(event: TouchEvent, touchIndex = 0): ScreenLocation | null {
    if (event.touches.length > touchIndex) {
      return new ScreenLocation(event.touches[touchIndex].clientX, event.touches[touchIndex].clientY)
    }
    if (event.changedTouches.length > touchIndex) {
      return new ScreenLocation(event.changedTouches[touchIndex].clientX, event.changedTouches[touchIndex].clientY)
    }
    return null
  }

  static getHoldCount(event: Event): number {
    if (this.isTouchEvent(event)) {
      return event.touches.length
    }
    if (this.isMouseEvent(event)) {
      return event.buttons === 1 || event.buttons === 2 ? 1 : 0
    }
    return 0
  }

  static getPinchAmount(event: TouchEvent): number {
    const p1 = this.getTouchEventLocation(event, 0)
    const p2 = this.getTouchEventLocation(event, 1)
    if (!p1 || !p2) {
      return 0
    }
    return MathUtil.distance(p1, p2)
  }

  static getPinchCenter(event: TouchEvent): ScreenLocation | null {
    const p1 = this.getTouchEventLocation(event, 0)
    const p2 = this.getTouchEventLocation(event, 1)
    if (!p1 || !p2) {
      return null
    }
    return MathUtil.middle(p1, p2)
  }
}
