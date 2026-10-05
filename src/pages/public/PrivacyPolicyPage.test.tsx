import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PrivacyPolicyPage } from './PrivacyPolicyPage'
import { PRIVACY_POLICY_VERSION } from '@/app/config/legal'

vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { name: 'Test', primaryColor: '#000' } }),
}))

// RF-08 — la política muestra la versión que se graba al aceptarla.
describe('PrivacyPolicyPage', () => {
  it('muestra la versión vigente de la política', () => {
    render(<MemoryRouter><PrivacyPolicyPage /></MemoryRouter>)
    expect(screen.getByText(`Versión ${PRIVACY_POLICY_VERSION}`)).toBeInTheDocument()
  })
})
