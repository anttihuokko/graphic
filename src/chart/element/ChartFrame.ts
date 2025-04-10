import { Container, Rect, Text, Element } from '@svgdotjs/svg.js'
import { GraphicEvent } from '../../GraphicEvent'
import { EventType } from '../Context'
import { PanelContext } from '../panel/PanelContext'
import { ChartElement } from './ChartElement'
import { Size } from '../../model/Size'
import { Box } from '../../model/Box'

export enum Location {
  RELATIVE,
  CENTER,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

export class TextDef {
  private static readonly TEXT_MARGIN = 10

  constructor(
    readonly location: Location,
    private readonly textElement: Text,
    private readonly relativeIndex: number,
    private readonly boundingElement: Element
  ) {}

  get text(): string {
    return this.textElement.text()
  }

  setText(text: string): void {
    this.textElement.text(text)
    this.updatePosition()
  }

  updatePosition(): void {
    const textBounds = Box.forSvgBox(this.textElement.bbox()).grow(1)
    const areaBounds = Box.forSvgBox(this.boundingElement.bbox())
    switch (this.location) {
      case Location.RELATIVE:
        this.textElement.move(TextDef.TEXT_MARGIN, TextDef.TEXT_MARGIN + textBounds.height * this.relativeIndex)
        break
      case Location.CENTER:
        this.textElement.center(areaBounds.centerX, areaBounds.centerY)
        break
      case Location.TOP:
        this.textElement.cx(areaBounds.centerX).y(TextDef.TEXT_MARGIN)
        break
      case Location.BOTTOM:
        this.textElement.cx(areaBounds.centerX).y(areaBounds.height - textBounds.height - TextDef.TEXT_MARGIN)
        break
      case Location.LEFT:
        this.textElement.x(TextDef.TEXT_MARGIN).cy(areaBounds.centerY)
        break
      case Location.RIGHT:
        this.textElement.x(areaBounds.width - textBounds.width - TextDef.TEXT_MARGIN).cy(areaBounds.centerY)
        break
      case Location.TOP_LEFT:
        this.textElement.move(TextDef.TEXT_MARGIN, TextDef.TEXT_MARGIN)
        break
      case Location.TOP_RIGHT:
        this.textElement.move(areaBounds.width - textBounds.width - TextDef.TEXT_MARGIN, TextDef.TEXT_MARGIN)
        break
      case Location.BOTTOM_LEFT:
        this.textElement.move(TextDef.TEXT_MARGIN, areaBounds.height - textBounds.height - TextDef.TEXT_MARGIN)
        break
      case Location.BOTTOM_RIGHT:
        this.textElement.move(
          areaBounds.width - textBounds.width - TextDef.TEXT_MARGIN,
          areaBounds.height - textBounds.height - TextDef.TEXT_MARGIN
        )
        break
      default:
        throw Error(`Unknown location enum value: ${this.location}`)
    }
  }
}

export abstract class ChartFrame extends ChartElement<PanelContext> {
  private readonly texts: TextDef[] = []

  private readonly frame: Rect

  constructor(className: string, eventTargetClassName: string, parent: Container, context: PanelContext) {
    super(className, parent, context)
    this.frame = this.container.rect(1, 1).addClass(eventTargetClassName).addClass('interactive')
    this.context.addEventListener(EventType.REPOSITION, () => this.refresh())
    this.context.addEventListener(EventType.COORDINATE_SYSTEM_UPDATE, () => this.refresh())
    this.context.addEventListener(EventType.REDRAW, () => this.refresh())
    this.context.addEventListener(EventType.VIEW_OFFSET, () => this.refresh())
    this.refresh()
  }

  isEventTarget(event: GraphicEvent): boolean {
    return this.frame === event.targetElement
  }

  setVisible(visibility: boolean): this {
    super.setVisible(visibility)
    this.refresh()
    return this
  }

  protected get size(): Size {
    const bounds = this.frame.bbox()
    return new Size(bounds.width, bounds.height)
  }

  protected addText(text: string, location: Location = Location.RELATIVE): TextDef {
    const relativeCount = this.texts.reduce((acc, def) => (def.location === Location.RELATIVE ? acc + 1 : acc), 0)
    const def = new TextDef(location, this.container.text(text), relativeCount, this.frame)
    this.texts.push(def)
    this.refresh()
    return def
  }

  protected refresh(): void {
    if (this.container.visible()) {
      const bounds = this.positionElements()
      if (!bounds.isEmpty()) {
        this.frame.size(bounds.width, bounds.height)
        this.translateTo(bounds.x, bounds.y)
        this.clip(Box.forSvgBox(this.frame.bbox()).move(this.elementOffset.x, this.elementOffset.y).grow(1))
        this.texts.forEach((def) => def.updatePosition())
      }
    }
  }

  protected abstract positionElements(): Box
}
