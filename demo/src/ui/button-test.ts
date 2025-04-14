import { TestComponent } from '..'
import { Graphic } from '../../../src/Graphic'
import { GraphicClickEvent } from '../../../src/GraphicEvent'
import { Button } from '../../../src/element/Button'

export const component: TestComponent = {
  title: 'Button Test',
  create: (container: HTMLDivElement) => {
    new TestGraphic(container)
  },
}

class TestGraphic extends Graphic {
  private selected = true

  constructor(container: HTMLElement) {
    super(container)
    new Button(this.symbols.angleDown, 'test1', this.svg).translateTo(10, 10)
    new Button(this.symbols.info, 'test2', this.svg).translateTo(10, 50)
    const button3 = new Button(this.symbols.info, 'test3', this.svg).setSelected(this.selected).translateTo(10, 90)
    new Button('Test1', 'test4', this.svg).translateTo(10, 130)
    const button5 = new Button('Test2', 'test5', this.svg).setSelected(this.selected).translateTo(10, 175)
    this.listen('gclick', (event: GraphicClickEvent) => {
      console.log('gclick', event)
      if (event.hasTargetElementClass('test3') || event.hasTargetElementClass('test5')) {
        this.selected = !this.selected
        button3.setSelected(this.selected)
        button5.setSelected(this.selected)
      }
    })
  }
}
