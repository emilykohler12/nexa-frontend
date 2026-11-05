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

  it('la versión vigente es 2026-11, la que incluye el uso del correo para recordatorios', () => {
    expect(PRIVACY_POLICY_VERSION).toBe('2026-11')
  })

  it('explica para qué se usa el correo: recordatorios, avisos de turno y mensajes de la cuenta, sin campañas', () => {
    render(<MemoryRouter><PrivacyPolicyPage /></MemoryRouter>)
    expect(screen.getByText(
      'Usamos tu correo electrónico para enviarte recordatorios de tus turnos (unas 5 horas antes), avisos cuando tu turno se cancela o se reprograma, y los mensajes de tu cuenta (verificación de correo y recuperación de contraseña). No lo usamos para campañas ni publicidad.'
    )).toBeInTheDocument()
  })
})
