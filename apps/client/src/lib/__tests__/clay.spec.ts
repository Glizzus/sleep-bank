import { describe, it, expect } from 'vitest'
import { debtClayColor } from '../clay'

const clay = (percent: string) => `color-mix(in srgb, var(--color-clay) ${percent}%, transparent)`

describe('debtClayColor', () => {
  it.each([
    ['no shortfall floors at the faintest clay', 0, '7.0'],
    ['negative shortfall clamps to the floor', -30, '7.0'],
    ['half an hour', 30, '11.0'],
    ['44 minutes rounds down to the 30-minute bucket', 44, '11.0'],
    ['46 minutes rounds up to the 1-hour bucket', 46, '15.0'],
    ['one hour', 60, '15.0'],
    ['ninety minutes', 90, '20.0'],
    ['two hours', 120, '24.0'],
    ['two and a half hours', 150, '28.0'],
    ['three hours hits the ceiling', 180, '32.0'],
    ['beyond three hours stays at the ceiling', 300, '32.0'],
  ])('%s (%i min)', (_, shortfallMinutes, percent) => {
    expect(debtClayColor(shortfallMinutes)).toBe(clay(percent))
  })
})
