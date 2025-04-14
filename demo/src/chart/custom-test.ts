import { TestComponent } from '..'
import { Color, Duration, LineChartDrawer, Time, TimeSeriesChart } from '../../../src'
import { GraphicClickEvent } from '../../../src/GraphicEvent'
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
    chart.moveCenterToTime(Time.fromISO('2021-06-10'))
  },
}
