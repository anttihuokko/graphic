import { TestComponent } from '..'
import {
  BarChartDrawer,
  Color,
  CustomChartDrawer,
  Duration,
  LineChartDrawer,
  Time,
  TimeSeriesChart,
} from '../../../src'
import { createDataSource } from './DataSource'

export const component: TestComponent = {
  title: 'Gap Test',
  create: (container: HTMLDivElement) => {
    const chart = new TimeSeriesChart(container, Duration.forDays(1), createDataSource())
    chart.updateSettings({
      gapsRemoved: true,
      gapsVisualized: true,
      debugInfoVisible: true,
    })
    chart.addPanel([
      new BarChartDrawer('Bars', Color.GREEN, 'value1', 'Testi info'),
      createCustomChartDrawerForGapTest2(),
    ])
    chart.addPanel([new LineChartDrawer('Line', Color.GREEN, 'value2')])
    chart.moveCenterToTime(Time.fromISO('2021-06-10'))
  },
}

/*
  function createCustomChartDrawerForGapTest1(): CustomChartDrawer {
    const drawer = new CustomChartDrawer('Test', Color.RED)
    drawer.addHorizontalLines([1000])
    drawer.addCircleMarker({ time: Time.fromISO('2021-06-02'), value: 1000 })
    drawer.addCircleMarker({ time: Time.fromISO('2021-06-10'), value: 100 })
    drawer.addCircleMarker({ time: Time.fromISO('2021-06-13'), value: 100 })
    drawer.addCircleMarker({ time: Time.fromISO('2021-06-17'), value: 1000 })
    drawer.addCircleMarker({ time: Time.fromISO('2021-06-19'), value: 2000 })
    return drawer
  }
  */

function createCustomChartDrawerForGapTest2(): CustomChartDrawer {
  const drawer = new CustomChartDrawer('Test', Color.RED)
  drawer.addHorizontalLines([1000])
  drawer.addCircleMarker({ time: Time.fromISO('2021-05-21'), value: 1000 })
  drawer.addCircleMarker({ time: Time.fromISO('2021-05-27'), value: 100 })
  drawer.addCircleMarker({ time: Time.fromISO('2021-06-02'), value: 100 })
  drawer.addCircleMarker({ time: Time.fromISO('2021-06-06'), value: 200 })
  drawer.addCircleMarker({ time: Time.fromISO('2021-06-14'), value: 200 })
  drawer.addCircleMarker({ time: Time.fromISO('2021-06-18'), value: 1000 })
  return drawer
}
