import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToothConditionPanel } from '@/components/patients/ToothConditionPanel'

describe('ToothConditionPanel', () => {
  it('renders all 20 conditions as checkboxes', () => {
    render(<ToothConditionPanel tooth={11} activeConditions={[]} onToggle={vi.fn()} />)
    expect(screen.getAllByRole('checkbox')).toHaveLength(20)
    expect(screen.getByLabelText('Caries')).toBeInTheDocument()
    expect(screen.getByLabelText('Reemplazo de prótesis')).toBeInTheDocument()
  })

  it('shows the tooth number and its type', () => {
    render(<ToothConditionPanel tooth={13} activeConditions={[]} onToggle={vi.fn()} />)
    expect(screen.getByText(/Diente 13/)).toBeInTheDocument()
    expect(screen.getByText(/Canino/)).toBeInTheDocument()
  })

  it('checks the boxes for active conditions', () => {
    render(<ToothConditionPanel tooth={11} activeConditions={['caries', 'movilidad']} onToggle={vi.fn()} />)
    expect(screen.getByLabelText('Caries')).toBeChecked()
    expect(screen.getByLabelText('Movilidad')).toBeChecked()
    expect(screen.getByLabelText('Gingivitis')).not.toBeChecked()
  })

  it('calls onToggle with the condition key and true when checking an unchecked box', () => {
    const onToggle = vi.fn()
    render(<ToothConditionPanel tooth={11} activeConditions={[]} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('Caries'))
    expect(onToggle).toHaveBeenCalledWith('caries', true)
  })

  it('calls onToggle with the condition key and false when unchecking a checked box', () => {
    const onToggle = vi.fn()
    render(<ToothConditionPanel tooth={11} activeConditions={['caries']} onToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('Caries'))
    expect(onToggle).toHaveBeenCalledWith('caries', false)
  })
})
