import { TestComponent } from '..'
import { Graphic } from '../../../src/Graphic'
import { TextFrame, TextLocation } from '../../../src/element/TextFrame'
import { Size } from '../../../src/model/Size'

export const component: TestComponent = {
  title: 'Text Frame Test',
  create: (container: HTMLDivElement) => {
    new TestGraphic(container)
  },
}

class TestGraphic extends Graphic {
  constructor(container: HTMLElement) {
    super(container)
    new TextFrame('', this.svg).border(true).setPadding(new Size(4, 3)).translateTo(10, 10).addText('Hello World!!!!')
    new TextFrame('', this.svg)
      .border(true)
      .setPadding(new Size(4, 3))
      .round(3)
      .translateTo(10, 40)
      .addText('Hello World!!!!')
    new TextFrame('', this.svg)
      .border(true)
      .round(3)
      .setPadding(new Size(10, 10))
      .translateTo(10, 70)
      .addText('Hello World!!!!')
    new TextFrame('', this.svg).border(true).translateTo(10, 115).addText('Loading...')
    new TextFrame('', this.svg).border(false).translateTo(10, 140).addText('Loading...')
    new TextFrame('', this.svg).border(false).round(3).translateTo(10, 165).addText('Loading...')

    const frame = new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(150, 10)
    frame.addText('Relative1', TextLocation.RELATIVE)
    frame.addText('Relative2', TextLocation.RELATIVE)
    frame.addText('Relative3', TextLocation.RELATIVE)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(150, 110)
      .setText('Center', TextLocation.CENTER)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(150, 210)
      .setText('Top', TextLocation.TOP)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(150, 310)
      .setText('Bottom', TextLocation.BOTTOM)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(150, 410)
      .setText('Left', TextLocation.LEFT)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(300, 10)
      .setText('Right', TextLocation.RIGHT)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(300, 110)
      .setText('Top Left', TextLocation.TOP_LEFT)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(300, 210)
      .setText('Top Right', TextLocation.TOP_RIGHT)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(300, 310)
      .setText('Bottom Left', TextLocation.BOTTOM_LEFT)

    new TextFrame('', this.svg)
      .setPadding(new Size(5, 5))
      .border(true)
      .setSize(new Size(120, 80))
      .translateTo(300, 410)
      .setText('Bottom Right', TextLocation.BOTTOM_RIGHT)
  }
}
