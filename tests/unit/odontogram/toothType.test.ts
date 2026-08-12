import { describe, it, expect } from 'vitest'
import { toothTypeLabel } from '@/lib/odontogram/toothType'

describe('toothTypeLabel', () => {
  it('labels positions 1-2 as Incisivo', () => {
    expect(toothTypeLabel(11)).toBe('Incisivo')
    expect(toothTypeLabel(42)).toBe('Incisivo')
  })

  it('labels position 3 as Canino', () => {
    expect(toothTypeLabel(13)).toBe('Canino')
    expect(toothTypeLabel(43)).toBe('Canino')
  })

  it('labels positions 4-5 as Premolar', () => {
    expect(toothTypeLabel(14)).toBe('Premolar')
    expect(toothTypeLabel(25)).toBe('Premolar')
  })

  it('labels positions 6-8 as Molar', () => {
    expect(toothTypeLabel(16)).toBe('Molar')
    expect(toothTypeLabel(38)).toBe('Molar')
  })
})
