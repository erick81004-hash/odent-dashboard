import { describe, it, expect } from 'vitest'
import { FDI_TEETH, isValidFdiTooth } from '@/lib/odontogram/fdi'

describe('fdi', () => {
  it('has exactly 32 teeth', () => {
    expect(FDI_TEETH).toHaveLength(32)
  })

  it('validates a real FDI code', () => {
    expect(isValidFdiTooth(11)).toBe(true)
    expect(isValidFdiTooth(48)).toBe(true)
  })

  it('rejects an invalid FDI code', () => {
    expect(isValidFdiTooth(19)).toBe(false)
    expect(isValidFdiTooth(0)).toBe(false)
  })
})
