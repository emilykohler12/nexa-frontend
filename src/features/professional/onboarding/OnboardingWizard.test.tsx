import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingWizard } from './OnboardingWizard'
import { api } from '@/shared/utils/api'
import type { WeeklyAvailability } from './types'

vi.mock('@/shared/utils/api', () => ({ api: { post: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37' } }),
}))
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Ana', email: 'ana@x.com', phone: '1155550000', gender: '' } }),
}))
// Solo interesan el paso de horarios y el avance; los demás pasos se reemplazan por stubs mínimos.
vi.mock('./steps/PersonalStep', () => ({ PersonalStep: () => null }))
vi.mock('./steps/WorkStep', () => ({
  WorkStep: ({ onChange }: { onChange: (f: { specialty: string }) => void }) =>
    <button onClick={() => onChange({ specialty: 'Uñas' })}>fijar especialidad</button>,
}))
vi.mock('./steps/ScheduleStep', () => ({
  ScheduleStep: ({ onChange }: { onChange: (a: WeeklyAvailability) => void }) => (
    <button onClick={() => onChange({
      monday: [{ start: '18:00', end: '09:00' }], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
    })}>cargar franja invertida</button>
  ),
}))
vi.mock('./steps/ServicesStep', () => ({ ServicesStep: () => null }))
vi.mock('./steps/PoliciesStep', () => ({ PoliciesStep: () => null }))
vi.mock('./steps/ConfirmationStep', () => ({ ConfirmationStep: () => null }))

describe('OnboardingWizard — franjas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no deja pasar del paso de horarios con el inicio posterior al fin', async () => {
    const user = userEvent.setup()
    render(<OnboardingWizard onComplete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.click(screen.getByText('fijar especialidad'))
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.click(screen.getByText('cargar franja invertida'))
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    expect(screen.getByText('Lunes: la hora de inicio tiene que ser anterior a la de fin.')).toBeInTheDocument()
    expect(screen.getByText('cargar franja invertida')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
  })
})
