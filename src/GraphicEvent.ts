import { Point, Element, Svg, SVG, Tspan } from '@svgdotjs/svg.js'
import { Graphic } from './Graphic'
import { EventUtil } from './internal/EventUtil'
import { ScreenLocation } from './model/ScreenLocation'
import { Offset } from './model/Offset'

export class GraphicEventListener<T extends GraphicEvent> {
  private listenerEnabled = false

  constructor(
    private readonly svg: Svg,
    readonly eventName: GraphicEventName,
    private readonly listener: (event: CustomEvent<T>) => void
  ) {
    this.enable()
  }

  get enabled() {
    return this.listenerEnabled
  }

  enable(): void {
    if (!this.enabled) {
      this.svg.on(this.eventName, this.listener as EventListener)
      this.listenerEnabled = true
    }
  }

  disable(): void {
    if (this.enabled) {
      this.svg.off(this.eventName, this.listener as EventListener)
      this.listenerEnabled = false
    }
  }
}

export type GraphicEventName =
  | 'gwheel'
  | 'ghover'
  | 'gholdstart'
  | 'gholdend'
  | 'gclick'
  | 'gdoubleclick'
  | 'gdragstart'
  | 'gdrag'
  | 'gdragend'
  | 'gdragslidestart'
  | 'gdragslide'
  | 'gdragslideend'
  | 'gpinchstart'
  | 'gpinch'
  | 'gpinchend'
  | 'gresize'

export interface GraphicEvent<T extends Event = Event> {
  readonly graphic: Graphic

  readonly nativeEvent: T

  readonly ctrlKey: boolean

  readonly shiftKey: boolean

  readonly altKey: boolean

  readonly documentPoint: Point

  readonly targetElement: Element | null

  hasTargetElementClass(className: string): boolean

  hasTargetElementParent(element: Element): boolean
}

abstract class BaseGraphicEvent<T extends Event> implements GraphicEvent<T> {
  readonly targetElement: Element | null

  constructor(
    readonly location: ScreenLocation,
    readonly graphic: Graphic,
    readonly nativeEvent: T
  ) {
    this.targetElement = this.getTargetElement()
  }

  get ctrlKey(): boolean {
    if (EventUtil.isMouseEvent(this.nativeEvent)) {
      return this.nativeEvent.ctrlKey
    }
    return false
  }

  get shiftKey(): boolean {
    if (EventUtil.isMouseEvent(this.nativeEvent)) {
      return this.nativeEvent.shiftKey
    }
    return false
  }

  get altKey(): boolean {
    if (EventUtil.isMouseEvent(this.nativeEvent)) {
      return this.nativeEvent.altKey
    }
    return false
  }

  get documentPoint(): Point {
    const bounds = this.graphic.getBoundingClientRect()
    return new Point(this.location.x - bounds.x, this.location.y - bounds.y)
  }

  hasTargetElementClass(className: string): boolean {
    return this.targetElement?.hasClass(className) ?? false
  }

  hasTargetElementParent(element: Element): boolean {
    return this.targetElement?.parents().includes(element) ?? false
  }

  private getTargetElement(): Element | null {
    const element = EventUtil.getTargetElement(this.nativeEvent)
    if (!element) {
      return null
    }
    const svgElement = SVG(element)
    if (!svgElement || svgElement instanceof Svg) {
      return null
    }
    return svgElement instanceof Tspan ? (svgElement.parent() as Element) : svgElement
  }
}

export class GraphicResizeEvent {
  constructor(readonly graphic: Graphic) {}
}

export class GraphicWheelEvent extends BaseGraphicEvent<WheelEvent> {
  constructor(
    readonly delta: number,
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: WheelEvent
  ) {
    super(location, graphic, nativeEvent)
  }
}

export class GraphicHoverEvent extends BaseGraphicEvent<MouseEvent | TouchEvent> {}

export class GraphicHoldEvent extends BaseGraphicEvent<WheelEvent> {}

export class GraphicClickEvent extends BaseGraphicEvent<MouseEvent | TouchEvent> {}

export class GraphicDoubleClickEvent extends BaseGraphicEvent<MouseEvent | TouchEvent> {}

export class GraphicDragEvent extends BaseGraphicEvent<MouseEvent | TouchEvent> {
  constructor(
    readonly delta: Offset,
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ) {
    super(location, graphic, nativeEvent)
  }
}

export class GraphicPinchEvent extends BaseGraphicEvent<MouseEvent | TouchEvent> {
  constructor(
    readonly amount: number,
    readonly delta: number,
    readonly center: ScreenLocation,
    location: ScreenLocation,
    graphic: Graphic,
    nativeEvent: MouseEvent | TouchEvent
  ) {
    super(location, graphic, nativeEvent)
  }
}
