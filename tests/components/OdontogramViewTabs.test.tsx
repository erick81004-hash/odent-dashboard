import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OdontogramViewTabs } from '@/components/patients/OdontogramViewTabs'

describe('OdontogramViewTabs', () => {
  it('renders both tabs', () => {
    render(<OdontogramViewTabs active="vestibular" onChange={vi.fn()} />)
    expect(screen.getByText('Vestibular')).toBeInTheDocument()
    expect(screen.getByText('Lingual y palatina')).toBeInTheDocument()
  })

  it('calls onChange with the clicked tab key', () => {
    const onChange = vi.fn()
    render(<OdontogramViewTabs active="vestibular" onChange={onChange} />)
    fireEvent.click(screen.getByText('Lingual y palatina'))
    expect(onChange).toHaveBeenCalledWith('lingual')
  })
})
