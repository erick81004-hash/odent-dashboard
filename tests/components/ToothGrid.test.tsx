import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToothGrid } from '@/components/patients/ToothGrid'

describe('ToothGrid', () => {
  it('renders all 32 teeth', () => {
    render(<ToothGrid activeConditionsByTooth={{}} selected={null} onSelect={vi.fn()} />)
    expect(screen.getAllByTestId(/^tooth-/)).toHaveLength(32)
  })

  it('shows a count badge whenever a tooth has active conditions', () => {
    render(
      <ToothGrid
        activeConditionsByTooth={{ 11: ['caries'], 12: ['caries', 'movilidad'] }}
        selected={null}
        onSelect={vi.fn()}
      />
    )
    expect(screen.queryByText('1', { selector: 'span' })).toBeInTheDocument()
    expect(screen.queryByText('2', { selector: 'span' })).toBeInTheDocument()
  })

  it('calls onSelect with the clicked tooth number', () => {
    const onSelect = vi.fn()
    render(<ToothGrid activeConditionsByTooth={{}} selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('tooth-24'))
    expect(onSelect).toHaveBeenCalledWith(24)
  })

  it('shows the tooth number as visible text on each button', () => {
    render(<ToothGrid activeConditionsByTooth={{}} selected={null} onSelect={vi.fn()} />)
    expect(screen.getByTestId('tooth-11')).toHaveTextContent('11')
    expect(screen.getByTestId('tooth-48')).toHaveTextContent('48')
  })
})
