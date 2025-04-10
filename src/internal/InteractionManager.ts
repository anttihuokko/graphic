import { Graphic } from '../Graphic'
import { ScreenLocation } from '../model/ScreenLocation'
import { EventUtil } from './EventUtil'
import {
  Interaction,
  HoldInteraction,
  WheelInteraction,
  DragInteraction,
  PinchInteraction,
  HoverInteraction,
  ClickInteraction,
  DoubleClickInteraction,
} from './Interaction'

export class InteractionManager {
  private static readonly MOVE_THRESHOLD = 10

  private static readonly DOUBLE_CLICK_TIMEOUT = 300

  private interactionInitialLocation: ScreenLocation | null = null

  private interactionInitialEvent: MouseEvent | TouchEvent | null = null

  private activeInteraction: Interaction<MouseEvent | TouchEvent> | null = null

  private doubleClickTimeoutHandle: NodeJS.Timeout | null = null

  constructor(private readonly graphic: Graphic) {
    this.graphic.svg.on('wheel', (event: Event) =>
      this.processEvent(event, (holds, location) => this.handleWheelInteraction(holds, location, event as WheelEvent))
    )
    this.graphic.svg.on('mousedown', (event: Event) =>
      this.processEvent(event, (holds, location) => this.handleInteractionInit(holds, location, event as MouseEvent))
    )
    this.graphic.svg.on('touchstart', (event: Event) =>
      this.processEvent(event, (holds, location) => this.handleInteractionInit(holds, location, event as TouchEvent))
    )
    this.graphic.svg.on('mousemove', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionPerformed(holds, location, event as MouseEvent)
      )
    )
    this.graphic.svg.on('touchmove', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionPerformed(holds, location, event as TouchEvent)
      )
    )
    this.graphic.svg.on('mouseup', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionEnd(holds, location, true, event as MouseEvent)
      )
    )
    this.graphic.svg.on('mouseleave', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionEnd(holds, location, false, event as MouseEvent)
      )
    )
    this.graphic.svg.on('dragend', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionEnd(holds, location, false, event as MouseEvent)
      )
    )
    this.graphic.svg.on('touchend', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionEnd(holds, location, true, event as TouchEvent)
      )
    )
    this.graphic.svg.on('touchleave', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionEnd(holds, location, false, event as TouchEvent)
      )
    )
    this.graphic.svg.on('touchcancel', (event: Event) =>
      this.processEvent(event, (holds, location) =>
        this.handleInteractionEnd(holds, location, false, event as TouchEvent)
      )
    )
  }

  private processEvent(event: Event, callback: (holds: number, location: ScreenLocation) => void) {
    if (event.cancelable) {
      event.preventDefault()
    }
    const location = EventUtil.getEventLocation(event)
    if (location) {
      callback(EventUtil.getHoldCount(event), location)
    }
  }

  private handleWheelInteraction(holds: number, location: ScreenLocation, event: WheelEvent): void {
    new WheelInteraction(holds, location).fireFinalEvent(location, this.graphic, event)
  }

  private handleInteractionInit(holds: number, location: ScreenLocation, event: MouseEvent | TouchEvent): void {
    if (holds > 0) {
      this.interactionInitialLocation = location
      this.interactionInitialEvent = event
      new HoldInteraction(holds, location).fireStartEvent(location, this.graphic, event)
    }
  }

  private handleInteractionStart(
    interaction: Interaction<MouseEvent | TouchEvent>,
    location: ScreenLocation,
    event: MouseEvent | TouchEvent
  ): void {
    new HoldInteraction(interaction.holds, location).fireFinalEvent(location, this.graphic, event)
    this.activeInteraction = interaction
    if (this.interactionInitialLocation && this.interactionInitialEvent) {
      this.activeInteraction.fireStartEvent(this.interactionInitialLocation, this.graphic, this.interactionInitialEvent)
    }
    this.activeInteraction.fireIntermediateEvent(location, this.graphic, event)
  }

  private handleInteractionPerformed(holds: number, location: ScreenLocation, event: MouseEvent | TouchEvent): void {
    if (this.activeInteraction) {
      if ((this.activeInteraction.holds === 1 && holds > 1) || (this.activeInteraction.holds > 1 && holds < 2)) {
        this.handleInteractionEnd(holds, location, false, event)
        this.handleInteractionInit(holds, location, event)
      } else {
        this.activeInteraction.fireIntermediateEvent(location, this.graphic, event)
      }
    } else if (this.interactionInitialLocation && this.hasMoved(this.interactionInitialLocation, location)) {
      if (holds === 1) {
        this.handleInteractionStart(new DragInteraction(holds, this.interactionInitialLocation), location, event)
      } else if (holds > 1) {
        this.handleInteractionStart(
          new PinchInteraction(holds, this.interactionInitialLocation, event),
          location,
          event
        )
      }
    } else {
      new HoverInteraction(location).fireFinalEvent(location, this.graphic, event)
    }
  }

  private handleInteractionEnd(
    holds: number,
    location: ScreenLocation,
    commit: boolean,
    event: MouseEvent | TouchEvent
  ): void {
    if (this.activeInteraction) {
      this.activeInteraction.fireFinalEvent(location, this.graphic, event)
    } else if (commit && this.interactionInitialLocation) {
      this.handleClickInteraction(holds, location, event)
    }
    this.activeInteraction = null
    this.interactionInitialLocation = null
    this.interactionInitialEvent = null
  }

  private handleClickInteraction(holds: number, location: ScreenLocation, event: MouseEvent | TouchEvent): void {
    const doubleClick = !!this.doubleClickTimeoutHandle
    new ClickInteraction(holds, location).fireFinalEvent(location, this.graphic, event)
    if (doubleClick) {
      if (this.doubleClickTimeoutHandle) {
        clearTimeout(this.doubleClickTimeoutHandle)
        this.doubleClickTimeoutHandle = null
      }
      new DoubleClickInteraction(holds, location).fireFinalEvent(location, this.graphic, event)
    } else {
      this.doubleClickTimeoutHandle = setTimeout(
        () => (this.doubleClickTimeoutHandle = null),
        InteractionManager.DOUBLE_CLICK_TIMEOUT
      )
    }
  }

  private hasMoved(initialLocation: ScreenLocation, location: ScreenLocation): boolean {
    return (
      Math.max(Math.abs(initialLocation.x - location.x), Math.abs(initialLocation.y - location.y)) >
      InteractionManager.MOVE_THRESHOLD
    )
  }
}
