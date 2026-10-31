import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentModal } from './AppointmentModal'
import type { Appointment, Professional } from './types'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn(), patch: vi.fn() },
}))

// El backend manda `start` como hora de Argentina sin zona: "YYYY-MM-DDTHH:mm:00".
const START_ART = new Date('2026-11-03T16:00:00-03:00')

const professionals: Professional[] = [{ id: 'p1', name: 'Lucía', color: '#069494' }]

const base: Appointment = {
  id: 'a1', title: 'Ana Pérez', clientName: 'Ana Pérez', clientPhone: '3764000000', clientEmail: 'ana@test.local',
  professionalId: 'p1', professionalName: 'Lucía', serviceId: 's1', serviceName: 'Corte',
  serviceDuration: 60, servicePrice: 10000,
  start: '2026-11-03T16:00:00', end: '2026-11-03T17:00:00',
  status: 'confirmed', paymentStatus: 'paid',
}

function setup(appointment: Partial<Appointment> = {}, onChangeStatus = vi.fn().mockResolvedValue(null)) {
  const props = {
    appointment: { ...base, ...appointment },
    professionals,
    onClose: vi.fn(),
    onCancel: vi.fn().mockResolvedValue(null),
    onReactivate: vi.fn().mockResolvedValue(null),
    onSave: vi.fn().mockResolvedValue(null),
    onRegisterBalancePayment: vi.fn().mockResolvedValue(null),
    onRegisterPolishRemoval: vi.fn().mockResolvedValue(null),
    onMarkDepositPaid: vi.fn().mockResolvedValue(null),
    onChangeStatus,
  }
  render(<AppointmentModal {...props} />)
  return { ...props, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) }
}

describe('AppointmentModal (administrador): estados e inasistencia', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('muestra la etiqueta del estado que manda el backend (statusLabel)', () => {
    vi.setSystemTime(START_ART)
    setup({ status: 'no_show_auto', statusLabel: 'No asistió (automático)' })

    expect(screen.getByText('No asistió (automático)')).toBeInTheDocument()
  })

  it('sin statusLabel usa el mapa local: «No asistió» y «No asistió (automático)»', () => {
    vi.setSystemTime(START_ART)
    setup({ status: 'cancelled_no_show' })

    expect(screen.getByText('No asistió')).toBeInTheDocument()
  })

  it('un turno confirmado ofrece «Marcar No asistió» (ya no «Marcar cancelado por inasistencia»)', () => {
    vi.setSystemTime(new Date(START_ART.getTime() + 5 * 60_000))
    setup()

    expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: /cancelado por inasistencia/i })).not.toBeInTheDocument()
  })

  it('antes de la hora de inicio «Marcar No asistió» está deshabilitado', () => {
    vi.setSystemTime(new Date(START_ART.getTime() - 60_000))
    setup()

    expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeDisabled()
  })

  it('marcar «No asistió» pide confirmación, cambia el estado por onChangeStatus y cierra el modal', async () => {
    vi.setSystemTime(new Date(START_ART.getTime() + 50 * 60_000))
    const { user, onChangeStatus, onClose } = setup()

    await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))
    expect(screen.getByText(/Pasaron más de 40 minutos: no se abre horario nuevo/)).toBeInTheDocument()
    expect(onChangeStatus).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Sí, marcar «No asistió»' }))

    expect(onChangeStatus).toHaveBeenCalledWith('a1', 'cancelled_no_show')
    expect(onClose).toHaveBeenCalled()
  })

  it('un turno «No asistió (automático)» se corrige a Finalizado o a Confirmado, sin los botones comunes de estado', async () => {
    vi.setSystemTime(new Date(START_ART.getTime() + 45 * 60_000))
    const { user, onChangeStatus } = setup({ status: 'no_show_auto', statusLabel: 'No asistió (automático)' })

    expect(screen.queryByRole('button', { name: 'Marcar finalizado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Confirmado)' }))
    await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

    expect(onChangeStatus).toHaveBeenCalledWith('a1', 'confirmed')
  })

  it('si el servidor rechaza la corrección (APPOINTMENT_OVERLAP) muestra el mensaje y no cierra', async () => {
    vi.setSystemTime(new Date(START_ART.getTime() + 45 * 60_000))
    const onChangeStatus = vi.fn().mockResolvedValue('No se puede confirmar: el turno se superpone con otro turno de la profesional.')
    const { user, onClose } = setup({ status: 'cancelled_no_show' }, onChangeStatus)

    await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Confirmado)' }))
    await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('se superpone con otro turno')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('«Marcar finalizado» pasa por onChangeStatus y no por el guardado de datos', async () => {
    vi.setSystemTime(START_ART)
    const { user, onChangeStatus, onSave } = setup()

    await user.click(screen.getByRole('button', { name: 'Marcar finalizado' }))

    expect(onChangeStatus).toHaveBeenCalledWith('a1', 'finished')
    expect(onSave).not.toHaveBeenCalled()
  })
})
