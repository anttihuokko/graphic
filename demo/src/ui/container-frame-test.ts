import { TestComponent } from '..'
import { Graphic } from '../../../src/Graphic'
import { ContainerFrame } from '../../../src/element/ContainerFrame'
import { Size } from '../../../src/model/Size'

export const component: TestComponent = {
  title: 'Container Frame Test',
  create: (container: HTMLDivElement) => {
    new TestGraphic(container)
  },
}

class TestGraphic extends Graphic {
  constructor(container: HTMLElement) {
    super(container)
    const frame1 = new ContainerFrame('', this.svg).setPadding(new Size(5, 5)).border(true).translateTo(10, 10)
    frame1.circle(50)
    frame1.rect(20, 20).move(200, 50)
    frame1.line(10, 50, 100, 70)
  }
}
