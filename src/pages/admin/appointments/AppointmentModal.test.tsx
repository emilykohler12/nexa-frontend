import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentModal } from './AppointmentModal'
import type { Appointment, Professional } from './types'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn(), patch: vi.fn() },
}))

vi.mock('@/shared/hooks/usePaymentRules', () => ({
  usePaymentRules: () => ({ cancellationHours: 12, refundPolicy: 'full' }),
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

  it('«Cancelar turno» abre el diálogo: la clienta avisó con 13 horas, se devuelve la seña y se manda el aviso', async () => {
    vi.setSystemTime(new Date(START_ART.getTime() - 13 * 3_600_000))
    const { user, onCancel, onClose } = setup({ paymentStatus: 'partial' })

    await user.click(screen.getByRole('button', { name: 'Cancelar turno' }))
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Avisó con 13 h 0 min de anticipación: se devuelve la seña.')
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar el turno' }))

    expect(onCancel).toHaveBeenCalledWith('a1', { cancelledBy: 'client', clientNoticeAt: '2026-11-03T06:00:00.000Z' })
    expect(onClose).toHaveBeenCalled()
  })

  it('un turno cancelado muestra quién cancelo, el aviso de la clienta y quién lo cargó', () => {
    vi.setSystemTime(START_ART)
    setup({
      status: 'cancelled', paymentStatus: 'refunded',
      cancellation: {
        cancelledBy: 'client', cancelledAt: '2026-11-02T18:00:00.000Z', refunded: true,
        noticeAt: '2026-11-02T15:00:00.000Z', noticeHours: 25, noticeChannel: 'whatsapp', noticeNote: 'Se enfermó',
        noticeLoadedBy: { id: 'u1', name: 'Lucía' }, noticeLoadedAt: '2026-11-02T18:00:00.000Z',
      },
    })

    const summary = screen.getByRole('region', { name: 'Cancelación' })
    expect(summary).toHaveTextContent('La clienta')
    expect(summary).toHaveTextContent('25 h 0 min')
    expect(summary).toHaveTextContent('WhatsApp')
    expect(summary).toHaveTextContent('Se enfermó')
    expect(summary).toHaveTextContent('Lucía')
    expect(summary).toHaveTextContent('Marcada como devuelta')
  })
})
