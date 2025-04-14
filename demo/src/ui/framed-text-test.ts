import { TestComponent } from '..'
import { Graphic } from '../../../src/Graphic'
import { FramedText } from '../../../src/element/FramedText'

export const component: TestComponent = {
  title: 'Framed Text Test',
  create: (container: HTMLDivElement) => {
    new TestGraphic(container)
  },
}

class TestGraphic extends Graphic {
  constructor(container: HTMLElement) {
    super(container)
    new FramedText(this.svg).setText('Hello World!!!!').translateTo(10, 10)
    new FramedText(this.svg, 3).setText('Hello World!!!!').translateTo(10, 40)
    new FramedText(this.svg, 3).setText('Hello World!!!!').setPadding(10).translateTo(10, 70)
  }
}
