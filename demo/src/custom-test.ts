import { TestComponent } from '.'
import { Color, Duration, LineChartDrawer, Time, TimeSeriesChart } from '../../src'
import { GraphicClickEvent } from '../../src/GraphicEvent'
import { createDataSource } from './DataSource'

export const component: TestComponent = {
  title: 'Custom Test',
  create: (container: HTMLDivElement) => {
    const chart = new TimeSeriesChart(container, Duration.forDays(1), createDataSource())
    chart.updateSettings({
      gapsRemoved: true,
      gapsVisualized: true,
      debugInfoVisible: false,
    })
    chart.addPanel([new LineChartDrawer('Line', Color.GREEN, 'value2')])
    chart.listen('gclick', (event: GraphicClickEvent) => {
      console.log(event)
    })
    const group = chart.svg.group().addClass('test0')
    group.rect(100, 100).addClass('test1').fill('#f06').addClass('interactive')
    group.circle(100).addClass('test2').move(50, 50).fill('blue').addClass('interactive')
    group.circle(3).addClass('test3').move(60, 60).fill('black').addClass('interactive')
    group.text('Hello').addClass('test4').move(40, 70)
    chart.moveCenterToTime(Time.fromISO('2021-06-10'))
  },
}
