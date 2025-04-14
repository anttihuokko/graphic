import { Svg, Symbol } from '@svgdotjs/svg.js'

export class Symbols {
  readonly angleUp: Symbol

  readonly angleDown: Symbol

  readonly expand: Symbol

  readonly info: Symbol

  constructor(svg: Svg) {
    this.angleUp = this.createAngleUpSymbol(svg)
    this.angleDown = this.createAngleDownSymbol(svg)
    this.expand = this.createExpandSymbol(svg)
    this.info = this.createInfoSymbol(svg)
  }

  private createAngleUpSymbol(svg: Svg): Symbol {
    return this.createAngleSymbol(0, svg)
  }

  private createAngleDownSymbol(svg: Svg): Symbol {
    return this.createAngleSymbol(180, svg)
  }

  private createAngleSymbol(rotation: number, svg: Svg): Symbol {
    const symbol = svg.symbol().viewbox(-1, -1, 12, 12).width(17).height(17)
    symbol
      .polyline([2, 8, 6, 4, 10, 8])
      .fill('none')
      .css('strokeWidth', '1.5')
      .css('strokeLinecap', 'round')
      .rotate(rotation)
    return symbol
  }

  private createExpandSymbol(svg: Svg): Symbol {
    const symbol = svg.symbol().viewbox(-0.6, -0.6, 12, 12).width(18).height(18)
    symbol
      .path(
        `
          M 2 2 h 2.5
          M 2 2 v 2.5
          M 7.5 2 h 2.5
          M 10 2.5 v 2.5
          M 7.5 10 h 2.5
          M 10 7.5 v 2.5
          M 2 10 h 2.5
          M 2 7.5 v 2.5
        `
      )
      .stroke({ width: 1, linecap: 'round' })
    return symbol
  }

  private createInfoSymbol(svg: Svg): Symbol {
    const symbol = svg.symbol().viewbox(0, 0, 14, 14).width(20).height(20)
    symbol.circle(11).center(7, 7).fill('none')
    symbol
      .path(
        `
          M 7 3.2 v 1.5
          M 7 5.8 v 4.5
        `
      )
      .stroke({ width: 1.4 })
    return symbol
  }
}
