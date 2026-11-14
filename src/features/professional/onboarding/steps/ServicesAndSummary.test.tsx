import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { api } from '@/shared/utils/api'
import { ServicesStep } from './ServicesStep'
import { ConfirmationStep } from './ConfirmationStep'
import { EMPTY_AVAILABILITY, EMPTY_PERSONAL, EMPTY_POLICIES, EMPTY_WORK } from '../types'
import type { OnboardingData, SelectedService } from '../types'

const EMPTY_DATA: OnboardingData = {
  personal: EMPTY_PERSONAL, work: EMPTY_WORK, availability: EMPTY_AVAILABILITY, services: [], policies: EMPTY_POLICIES,
}

vi.mock('@/shared/utils/api', () => ({ api: { get: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({ business: { primaryColor: '#069494', accentColor: '#d4af37', services: [] } }),
}))

function Harness() {
  const [selected, setSelected] = useState<SelectedService[]>([])
  return (
    <>
      <ServicesStep selected={selected} onChange={setSelected} />
      <ConfirmationStep data={{ ...EMPTY_DATA, services: selected }} />
    </>
  )
}

describe('formulario de la profesional: servicios', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockResolvedValue({ data: { services: [
      { id: '52fcbab4-a56b-4706-8fbb-c8f3d4253c26', name: 'Capping manos', duration: 90, price: 22000, status: 'active' },
    ] } } as never)
  })

  it('el resumen final muestra el nombre del servicio elegido, nunca su id', async () => {
    render(<Harness />)
    await userEvent.click(await screen.findByRole('checkbox'))

    expect(screen.getByText('Servicios (1)')).toBeInTheDocument()
    // El nombre aparece en la lista de elección y en el resumen.
    expect(screen.getAllByText('Capping manos')).toHaveLength(2)
    expect(screen.queryByText('52fcbab4-a56b-4706-8fbb-c8f3d4253c26')).not.toBeInTheDocument()
  })

  it('no ofrece los servicios simultáneos (combos): los asigna el administrador', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { services: [
      { id: 's1', name: 'Capping manos', duration: 90, price: 22000, status: 'active', isCombo: false },
      { id: 'c1', name: 'Extensiones + Capping', duration: 120, price: 42000, status: 'active', isCombo: true },
    ] } } as never)
    render(<Harness />)

    expect(await screen.findByText('Capping manos')).toBeInTheDocument()
    expect(screen.queryByText('Extensiones + Capping')).not.toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  })

  it('los textos del paso son negros y grandes para que se lean', async () => {
    render(<Harness />)
    const name = await screen.findByText('Capping manos')
    expect(name).toHaveStyle({ color: 'rgb(0, 0, 0)', fontSize: '19px' })
    expect(screen.getByText(/precio sugerido/)).toHaveStyle({ color: 'rgb(0, 0, 0)', fontSize: '16px' })
  })
})
