import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentDialog } from './AppointmentDialog'
import type { Appointment } from '@/features/professional/types/appointment'

// 16:00 ART (UTC-3) del 03/11/2026.
const START = new Date('2026-11-03T16:00:00-03:00')

const base: Appointment = {
  id: 'a1',
  client: { id: 'c1', name: 'Ana Pérez', phone: '3764000000', email: 'ana@test.local', photo: null, allergies: '', notes: '' },
  serviceName: 'Corte', servicePrice: 10000, duration: 60,
  date: '2026-11-03', time: '16:00',
  status: 'confirmed', paymentStatus: 'paid', arrivedAt: null,
  internalNotes: '', isSimultaneous: false,
}

function setup(appointment: Partial<Appointment> = {}, onChangeStatus = vi.fn().mockResolvedValue(null)) {
  const props = {
    appointment: { ...base, ...appointment },
    primary: '#069494',
    accent: '#d4af37',
    onClose: vi.fn(),
    onSave: vi.fn(),
    onMarkArrival: vi.fn(),
    onChangeStatus,
  }
  render(<AppointmentDialog {...props} />)
  return { ...props, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) }
}

describe('AppointmentDialog (profesional): inasistencia', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('«No asistió» ya no es una opción del selector de estado: tiene su propia acción', () => {
    vi.setSystemTime(START)
    setup()

    expect(screen.getByRole('button', { name: 'Confirmado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'No asistió' })).not.toBeInTheDocument()
  })

  it('desde la hora de inicio marca «No asistió» después de confirmar y cierra el diálogo', async () => {
    vi.setSystemTime(new Date(START.getTime() + 10 * 60_000))
    const { user, onChangeStatus, onClose, appointment } = setup()

    await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))
    expect(screen.getByText(/Se abrirá un horario nuevo desde ahora/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, marcar «No asistió»' }))

    expect(onChangeStatus).toHaveBeenCalledWith(appointment, 'cancelled_no_show')
    expect(onClose).toHaveBeenCalled()
  })

  it('antes de la hora de inicio no se puede marcar', () => {
    vi.setSystemTime(new Date(START.getTime() - 60_000))
    setup()

    expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeDisabled()
  })

  it('un turno «No asistió (automático)» muestra su estado y ofrece corregirlo', async () => {
    vi.setSystemTime(new Date(START.getTime() + 45 * 60_000))
    const { user, onChangeStatus, appointment } = setup({ status: 'no_show_auto', statusLabel: 'No asistió (automático)' })

    expect(screen.getByText('No asistió (automático)')).toBeInTheDocument()
    // Sin selector de estado: primero se corrige la inasistencia.
    expect(screen.queryByRole('button', { name: 'Confirmado' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Finalizado)' }))
    await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

    expect(onChangeStatus).toHaveBeenCalledWith(appointment, 'finished')
  })

  it('si el servidor rechaza la corrección muestra el mensaje y deja abierto el diálogo', async () => {
    vi.setSystemTime(new Date(START.getTime() + 45 * 60_000))
    const onChangeStatus = vi.fn().mockResolvedValue('No se puede confirmar: el turno se superpone con otro turno de la profesional.')
    const { user, onClose } = setup({ status: 'cancelled_no_show' }, onChangeStatus)

    await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Confirmado)' }))
    await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('se superpone con otro turno')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('en la agenda el estado se muestra con «No asistió» para el que marca el personal', () => {
    vi.setSystemTime(new Date(START.getTime() + 45 * 60_000))
    setup({ status: 'cancelled_no_show' })

    expect(screen.getByText('No asistió')).toBeInTheDocument()
  })

  it('el aviso de llegada habla de 30 minutos y de «No asistió (automático)»', () => {
    vi.setSystemTime(START)
    setup()

    expect(screen.getByText(/pasados 30 min de la hora pactada se marca "No asistió \(automático\)"/)).toBeInTheDocument()
  })
})
