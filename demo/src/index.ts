import { BarChartDrawer, Color, CustomChartDrawer, Duration, LineChartDrawer, Time, TimeSeriesChart } from '../../src'
import { createDataSource } from './DataSource'

function component() {
  console.log('--- INIT CHART')
  const container = document.createElement('div')

  container.setAttribute('style', 'height: 800px;')

  const chart = new TimeSeriesChart(container, Duration.forDays(1), createDataSource())
  chart.updateSettings({
    gapsRemoved: true,
    gapsVisualized: true,
    debugInfoVisible: false,
  })
  chart.addPanel([new BarChartDrawer('Bars', Color.GREEN, 'value1'), createCustomChartDrawerForGapTest2()])
  chart.addPanel([new LineChartDrawer('Line', Color.GREEN, 'value2')])
  /*
      chart.listen('gclick', (event: GraphicClickEvent) => {
        // console.log(event)
        // console.log(event.getDocumentPoint())
        console.log('Result', event.getTargetElements())
      })
      */
  /*
      const group = chart.svg.group().addClass('test0')
      group.rect(100, 100).addClass('test1').fill('#f06')
      group.circle(100, 100).addClass('test2').move(50, 50).fill('blue')
      group.circle(3, 3).addClass('test3').move(60, 60).fill('black')
      group.text("Hello").addClass('test4').move(40, 70)
      */
  chart.moveCenterToTime(Time.fromISO('2021-06-10'))

  return container
}

/*
  function getGapTimesForTest1(): DateTime[] {
    return [DateTime.utc(2021, 6, 11), DateTime.utc(2021, 6, 12)]
  }
  */

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

document.body.appendChild(component())
