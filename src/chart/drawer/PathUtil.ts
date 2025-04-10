import { Point } from '@svgdotjs/svg.js'

export class PathUtil {
  static readonly MAX_SAFE_COORDINATE = 100000000

  static readonly MIN_SAFE_COORDINATE = -PathUtil.MAX_SAFE_COORDINATE

  static getLinePathDef(x1: number, y1: number, x2: number, y2: number): string {
    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
    `
  }

  static getPolylinePathDef(points: Point[]): string {
    return points.reduce((acc, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`
      }
      return acc + `L ${point.x} ${point.y}`
    }, '')
  }

  static getRectPathDef(x: number, y: number, width: number, height: number): string {
    return `
      M ${x - width / 2} ${y}
      h ${width}
      v ${height}
      h ${-width}
      Z
    `
  }

  static getCirclePathDef(x: number, y: number, r: number): string {
    return `
      M ${x - r} ${y}
      a ${r} ${r} 0 1 0 ${r * 2} 0
      a ${r} ${r} 0 1 0 ${-r * 2} 0
      Z
    `
  }

  static trimPathDef(def: string): string {
    return def.replace(/\s+/g, ' ').trim()
  }
}
