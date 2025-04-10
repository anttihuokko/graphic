import { Svg, SVG } from '@svgdotjs/svg.js'
import { GraphicEventListener, GraphicEvent, GraphicEventName, GraphicResizeEvent } from './GraphicEvent'
import { InteractionManager } from './internal/InteractionManager'
import { Symbols } from './Symbols'
import { PollingResizeObserver } from './internal/ResizeObserver'
import { Size } from './model/Size'

export class Graphic {
  readonly svg: Svg

  readonly nativeElement: SVGElement

  private readonly resizeObserver: PollingResizeObserver

  private graphicSize: Size

  readonly symbols: Symbols

  constructor(container: HTMLElement) {
    this.svg = SVG().addTo(container).addClass('graphic')
    this.nativeElement = container.querySelector<SVGElement>('svg')!
    this.resizeObserver = new PollingResizeObserver(this.nativeElement.parentElement!, () => this.handleResize())
    this.graphicSize = this.getGraphicSize()
    new InteractionManager(this)
    this.symbols = new Symbols(this.svg)
    this.resizeObserver.enable()
  }

  get size(): Size {
    return this.graphicSize
  }

  listen<T extends GraphicEvent>(eventName: GraphicEventName, listener: (event: T) => void): GraphicEventListener<T> {
    return new GraphicEventListener<T>(this.svg, eventName, (event: CustomEvent) => listener(event.detail))
  }

  delete(): void {
    this.resizeObserver.disable()
    this.svg.remove()
  }

  private handleResize(): void {
    const size = this.getGraphicSize()
    if (!size.isZero()) {
      this.graphicSize = size
      this.svg.fire('gresize', new GraphicResizeEvent(this))
    }
  }

  private getGraphicSize(): Size {
    const bounds = this.nativeElement.getBoundingClientRect()
    return new Size(bounds.width, bounds.height)
  }
}
