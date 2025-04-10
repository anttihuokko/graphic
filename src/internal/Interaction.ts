import { Graphic } from '../Graphic'
import {
  GraphicClickEvent,
  GraphicDoubleClickEvent,
  GraphicDragEvent,
  GraphicEvent,
  GraphicEventName,
  GraphicHoldEvent,
  GraphicHoverEvent,
  GraphicPinchEvent,
  GraphicWheelEvent,
} from '../GraphicEvent'
import { Offset } from '../model/Offset'
import { ScreenLocation } from '../model/ScreenLocation'
import { EventUtil } from './EventUtil'
import { MathUtil } from './MathUtil'

export abstract class Interaction<T extends Event> {
  constructor(
    readonly startEventName: GraphicEventName | null,
    readonly intermediateEventName: GraphicEventName | null,
    readonly finalEventName: GraphicEventName | null,
    readonly holds: number,
    readonly initialLocation: ScreenLocation
  ) {}

  fireStartEvent(location: ScreenLocation, graphic: Graphic, nativeEvent: T): void {
    this.fireEvent(this.startEventName, location, graphic, nativeEvent)
  }

  fireIntermediateEvent(location: ScreenLocation, graphic: Graphic, nativeEvent: T): void {
    this.fireEvent(this.intermediateEventName, location, graphic, nativeEvent)
  }

  fireFinalEvent(location: ScreenLocation, graphic: Graphic, nativeEvent: T): void {
    this.fireEvent(this.finalEventName, location, graphic, nativeEvent)
  }

  private fireEvent(
    eventName: GraphicEventName | null,
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: T
  ): void {
    if (eventName) {
      graphic.svg.fire(eventName, this.createGraphicEvent(location, graphic, nativeEvent))
    }
  }

  abstract createGraphicEvent(location: ScreenLocation, graphic: Graphic, nativeEvent: T): GraphicEvent<T>
}

export class WheelInteraction extends Interaction<WheelEvent> {
  constructor(holds: number, initialLocation: ScreenLocation) {
    super(null, null, 'gwheel', holds, initialLocation)
  }

  createGraphicEvent(location: ScreenLocation, graphic: Graphic, nativeEvent: WheelEvent): GraphicWheelEvent {
    return new GraphicWheelEvent(nativeEvent.deltaY, location, graphic, nativeEvent)
  }
}

export class HoldInteraction extends Interaction<MouseEvent | TouchEvent> {
  constructor(holds: number, initialLocation: ScreenLocation) {
    super('gholdstart', null, 'gholdend', holds, initialLocation)
  }

  createGraphicEvent(location: ScreenLocation, graphic: Graphic, nativeEvent: WheelEvent): GraphicHoldEvent {
    return new GraphicHoldEvent(location, graphic, nativeEvent)
  }
}

export class HoverInteraction extends Interaction<MouseEvent | TouchEvent> {
  constructor(initialLocation: ScreenLocation) {
    super(null, null, 'ghover', 0, initialLocation)
  }

  createGraphicEvent(
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ): GraphicHoverEvent {
    return new GraphicHoverEvent(location, graphic, nativeEvent)
  }
}

export class ClickInteraction extends Interaction<MouseEvent | TouchEvent> {
  constructor(holds: number, initialLocation: ScreenLocation) {
    super(null, null, 'gclick', holds, initialLocation)
  }

  createGraphicEvent(
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ): GraphicClickEvent {
    return new GraphicClickEvent(location, graphic, nativeEvent)
  }
}

export class DoubleClickInteraction extends Interaction<MouseEvent | TouchEvent> {
  constructor(holds: number, initialLocation: ScreenLocation) {
    super(null, null, 'gdoubleclick', holds, initialLocation)
  }

  createGraphicEvent(
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ): GraphicClickEvent {
    return new GraphicDoubleClickEvent(location, graphic, nativeEvent)
  }
}

export class DragInteraction extends Interaction<MouseEvent | TouchEvent> {
  private previousLocation: ScreenLocation

  constructor(holds: number, initialLocation: ScreenLocation) {
    super('gdragstart', 'gdrag', 'gdragend', holds, initialLocation)
    this.previousLocation = initialLocation
  }

  createGraphicEvent(
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ): GraphicDragEvent {
    const offset = new Offset(location.x - this.previousLocation.x, location.y - this.previousLocation.y)
    this.previousLocation = location
    return new GraphicDragEvent(offset, location, graphic, nativeEvent)
  }
}

export class PinchInteraction extends Interaction<MouseEvent | TouchEvent> {
  private previousLocation: ScreenLocation

  private previousPinchAmount = 0

  constructor(holds: number, initialLocation: ScreenLocation, nativeEvent: MouseEvent | TouchEvent) {
    super('gpinchstart', 'gpinch', 'gpinchend', holds, initialLocation)
    this.previousLocation = initialLocation
    this.previousPinchAmount = this.getPinchAmount(initialLocation, nativeEvent)
  }

  createGraphicEvent(
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ): GraphicPinchEvent {
    const pinchAmount = this.getPinchAmount(location, nativeEvent)
    const pinchDelta = pinchAmount - this.previousPinchAmount
    const pinchCenter = this.getPinchCenter(location, nativeEvent)
    this.previousLocation = location
    this.previousPinchAmount = pinchAmount
    return new GraphicPinchEvent(pinchAmount, pinchDelta, pinchCenter, location, graphic, nativeEvent)
  }

  private getPinchAmount(location: ScreenLocation, nativeEvent: MouseEvent | TouchEvent): number {
    if (EventUtil.isTouchEvent(nativeEvent)) {
      return EventUtil.getPinchAmount(nativeEvent as TouchEvent)
    }
    return MathUtil.distance(this.initialLocation, location)
  }

  private getPinchCenter(location: ScreenLocation, nativeEvent: MouseEvent | TouchEvent): ScreenLocation {
    if (EventUtil.isTouchEvent(nativeEvent)) {
      const result = EventUtil.getPinchCenter(nativeEvent as TouchEvent)
      if (result) {
        return result
      }
    }
    return MathUtil.middle(location, this.previousLocation)
  }
}
