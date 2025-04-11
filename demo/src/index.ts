import { component as component1 } from './gap-test'
import { component as component2 } from './custom-test'

export type TestComponent = {
  title: string
  create: (container: HTMLDivElement) => void
}

const components: TestComponent[] = [component1, component2]

function component(): HTMLElement {
  const params = new URLSearchParams(window.location.search)
  const componentId = Number(params.get('c') ?? 1)
  const container = document.createElement('div')
  container.appendChild(createTestComponentSelect(componentId))
  const component = components[componentId - 1]
  if (component) {
    const graphicContainer = document.createElement('div')
    graphicContainer.style.height = '90vh'
    container.appendChild(graphicContainer)
    component.create(graphicContainer)
  }
  return container
}

function createTestComponentSelect(selectedComponentId: number): HTMLSelectElement {
  const select = document.createElement('select')
  select.onchange = () => {
    const params = new URLSearchParams()
    params.set('c', select.value)
    window.location.search = params.toString()
  }
  for (let index = 0; index < components.length; index++) {
    const option = document.createElement('option')
    const componentId = index + 1
    option.value = String(componentId)
    option.text = components[index].title
    option.selected = selectedComponentId === componentId
    select.appendChild(option)
  }
  return select
}

document.body.appendChild(component())
