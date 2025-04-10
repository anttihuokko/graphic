import { GraphicClickEvent } from '../../GraphicEvent'
import { Time } from '../../model/Time'

export type MarkerClickCallback = (time: Time, value: number) => void

export interface ChartMarker {
  readonly markerId: number

  setFocused(focused: boolean): void

  handleClickEvent(event: GraphicClickEvent): void
}
