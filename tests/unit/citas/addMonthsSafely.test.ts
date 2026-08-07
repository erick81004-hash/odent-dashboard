import { describe, it, expect } from 'vitest'
import { addMonthsSafely } from '@/components/calendario/CalendarioClient'

describe('addMonthsSafely', () => {
  it('does not skip February when advancing from January 31st', () => {
    const result = addMonthsSafely(new Date(2026, 0, 31), 1)
    expect(result.getMonth()).toBe(1)
  })

  it('does not skip a short month when going backward from March 31st', () => {
    const result = addMonthsSafely(new Date(2026, 2, 31), -1)
    expect(result.getMonth()).toBe(1)
  })

  it('advances a mid-month date normally', () => {
    const result = addMonthsSafely(new Date(2026, 6, 15), 1)
    expect(result.getMonth()).toBe(7)
  })
})
