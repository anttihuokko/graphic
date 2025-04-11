import { parseInt, repeat, toString, chain } from 'lodash'
import { Range } from '../../model/Range'

export interface GridDefinition {
  gridIntervalCount: number
  gridIntervalPixels: number
  gridIntervalSize: number
  gridValueRange: Range
}

export function getGridDefinition(
  valueRange: Range,
  totalPixels: number,
  preferredIntervalPixels: number,
  multipliers: number[]
): GridDefinition {
  const intervalSize = getGridIntervalSize(valueRange, totalPixels, preferredIntervalPixels, multipliers)
  let intervalCount = Math.ceil(valueRange.size / intervalSize)
  let gridMinValue = valueRange.start
  if (gridMinValue !== 0) {
    gridMinValue = gridMinValue - (gridMinValue % intervalSize)
    if (gridMinValue >= valueRange.start) {
      intervalCount++
      gridMinValue = gridMinValue - intervalSize
    }
  }
  let gridMaxValue = gridMinValue + intervalCount * intervalSize
  if (valueRange.end >= gridMaxValue) {
    intervalCount++
    gridMaxValue = gridMaxValue + intervalSize
  }
  return {
    gridIntervalCount: intervalCount,
    gridIntervalPixels: Math.round(totalPixels / intervalCount),
    gridIntervalSize: intervalSize,
    gridValueRange: new Range(gridMinValue, gridMaxValue),
  }
}

function getGridIntervalSize(
  valueRange: Range,
  totalGridPixels: number,
  preferredIntervalPixels: number,
  multipliers: number[]
): number {
  const preferredIntervalSize = Math.round(valueRange.size / (totalGridPixels / preferredIntervalPixels))
  const intervalRangeMagnitude = parseInt('1' + repeat('0', toString(preferredIntervalSize).length - 1))
  return chain(multipliers)
    .map((multiplier) => intervalRangeMagnitude * multiplier)
    .map((intervalSize) => ({ intervalSize: intervalSize, offset: Math.abs(intervalSize - preferredIntervalSize) }))
    .minBy('offset')
    .value().intervalSize
}
