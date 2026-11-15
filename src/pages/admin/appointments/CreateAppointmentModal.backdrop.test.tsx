import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateAppointmentModal } from './CreateAppointmentModal'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: { services: [] } }), post: vi.fn(), patch: vi.fn() },
}))

// PM-06 (13/11/2026): el formulario de turnos del administrador no se cierra al tocar afuera (se perdía lo cargado).
describe('PM-06 CreateAppointmentModal (administrador): cierre del formulario', () => {
  function setup() {
    const onClose = vi.fn()
    const { container } = render(
      <CreateAppointmentModal professionals={[{ id: 'p1', name: 'Lucía', color: '#069494' }]} onClose={onClose} onCreated={vi.fn()} />,
    )
    return { onClose, backdrop: container.firstElementChild as HTMLElement }
  }

  it('PM-06 tocar fuera del formulario NO lo cierra', async () => {
    const { onClose, backdrop } = setup()
    await userEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('PM-06 la cruz lo cierra', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
