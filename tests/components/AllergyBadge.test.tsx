import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllergyBadge } from '@/components/patients/AllergyBadge'

describe('AllergyBadge', () => {
  it('shows the allergy text when present', () => {
    render(<AllergyBadge allergies="Penicilina" />)
    expect(screen.getByText(/Alergia: Penicilina/)).toBeInTheDocument()
  })

  it('renders nothing when there are no allergies', () => {
    const { container } = render(<AllergyBadge allergies={null} />)
    expect(container).toBeEmptyDOMElement()
  })
})
