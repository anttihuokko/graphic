export class Color {
  static readonly BLACK = Color.forName('black')
  static readonly WHITE = Color.forName('white')
  static readonly GREY = Color.forName('grey')
  static readonly GREEN = Color.forName('green')
  static readonly RED = Color.forName('red')
  static readonly BLUE = Color.forName('blue')
  static readonly ORANGE = Color.forName('orange')

  static forName(name: string): Color {
    return new Color(name)
  }

  static forHex(hex: string): Color {
    return new Color(hex.startsWith('#') ? hex : `#${hex}`)
  }

  static forRgb(r: number, g: number, b: number): Color {
    return new Color(`rgb(${r}, ${g}, ${b})`)
  }

  static forRgba(r: number, g: number, b: number, a: number): Color {
    return new Color(`rgba(${r}, ${g}, ${b}, ${a})`)
  }

  private constructor(readonly value: string) {}
}
