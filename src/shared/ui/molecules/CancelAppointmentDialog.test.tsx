import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CancelAppointmentDialog } from './CancelAppointmentDialog'

vi.mock('@/shared/hooks/usePaymentRules', () => ({
  usePaymentRules: () => ({ cancellationHours: 12, refundPolicy: 'full' }),
}))

// Turno: 03/11/2026 16:00 (hora de Argentina = UTC-3).
const DATE = '2026-11-03'
const TIME = '16:00'
const START = new Date(`${DATE}T${TIME}:00-03:00`)
const hoursBefore = (h: number) => new Date(START.getTime() - h * 3_600_000)

function setup(props: Partial<React.ComponentProps<typeof CancelAppointmentDialog>> = {}) {
  const onConfirm = vi.fn().mockResolvedValue(null)
  const onDone = vi.fn()
  const onClose = vi.fn()
  render(
    <CancelAppointmentDialog
      role="admin" date={DATE} time={TIME} paymentStatus="partial" accent="#069494"
      onConfirm={onConfirm} onDone={onDone} onClose={onClose} {...props}
    />,
  )
  return { onConfirm, onDone, onClose, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) }
}

const noticeInput = () => screen.getByLabelText('Día y hora en que avisó la clienta') as HTMLInputElement
const confirmButton = () => screen.getByRole('button', { name: 'Sí, cancelar el turno' })

describe('CancelAppointmentDialog', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('paso 1: pregunta quién cancela y no deja confirmar hasta elegir', () => {
    vi.setSystemTime(hoursBefore(20))
    setup()

    expect(screen.getByText('¿Quién cancela?')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /La clienta avisó/ })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /El estudio cancela/ })).not.toBeChecked()
    expect(confirmButton()).toBeDisabled()
  })

  it('si avisó la clienta, la hora de aviso viene por defecto con ahora (hora de Argentina)', async () => {
    vi.setSystemTime(new Date('2026-11-02T10:30:45-03:00'))
    const { user } = setup()

    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    expect(noticeInput().value).toBe('2026-11-02T10:30')
    expect(noticeInput().max).toBe('2026-11-02T10:30')
    expect(screen.getByLabelText('Medio por el que avisó (opcional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Nota (opcional)')).toBeInTheDocument()
  })

  it('el medio ofrece WhatsApp, llamada, en persona y otro', async () => {
    vi.setSystemTime(hoursBefore(20))
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    const options = Array.from((screen.getByLabelText('Medio por el que avisó (opcional)') as HTMLSelectElement).options).map(o => o.text)
    expect(options).toEqual(['Sin indicar', 'WhatsApp', 'Llamada', 'En persona', 'Otro'])
  })

  it('bloquea una hora de aviso futura', async () => {
    vi.setSystemTime(hoursBefore(20))
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    // Ahora son las 20:00 ART del 02/11.
    fireEvent.change(noticeInput(), { target: { value: '2026-11-02T20:01' } })
    expect(screen.getByRole('alert')).toHaveTextContent('La hora de aviso no puede ser futura.')
    expect(confirmButton()).toBeDisabled()

    fireEvent.change(noticeInput(), { target: { value: '2026-11-02T20:00' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()
  })

  it.each([
    [13, 'Avisó con 13 h 0 min de anticipación: se devuelve la seña.'],
    [12, 'Avisó con 12 h 0 min de anticipación: se devuelve la seña.'],
  ])('con %i horas de aviso se devuelve la seña', async (hours, text) => {
    vi.setSystemTime(hoursBefore(hours))
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    expect(screen.getByRole('status')).toHaveTextContent(text)
  })

  it('con 11 horas de aviso la seña queda retenida', async () => {
    vi.setSystemTime(hoursBefore(11))
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    expect(screen.getByRole('status')).toHaveTextContent('Avisó con 11 h 0 min de anticipación: la seña queda retenida.')
  })

  it('el resultado se recalcula al cambiar la hora de aviso', async () => {
    vi.setSystemTime(hoursBefore(1))
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))
    expect(screen.getByRole('status')).toHaveTextContent('queda retenida')

    fireEvent.change(noticeInput(), { target: { value: '2026-11-02T22:00' } }) // 18 h antes de las 16:00
    expect(screen.getByRole('status')).toHaveTextContent('Avisó con 18 h 0 min de anticipación: se devuelve la seña.')
  })

  it('un aviso posterior al inicio del turno se acepta y la seña queda retenida', async () => {
    vi.setSystemTime(new Date(START.getTime() + 2 * 3_600_000))
    const { user } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    expect(screen.getByRole('status')).toHaveTextContent('posterior al inicio del turno: la seña queda retenida')
    expect(confirmButton()).toBeEnabled()
  })

  it('el estudio cancela: se devuelve toda la seña, sin pedir hora de aviso', async () => {
    vi.setSystemTime(hoursBefore(2))
    const { user, onConfirm, onDone } = setup()

    await user.click(screen.getByRole('radio', { name: /El estudio cancela/ }))

    expect(screen.queryByLabelText('Día y hora en que avisó la clienta')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Se devuelve toda la seña.')
    expect(screen.getByRole('status')).toHaveTextContent('el dinero se devuelve por fuera')
    await user.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith({ cancelledBy: 'studio' })
    expect(onDone).toHaveBeenCalled()
  })

  it('sin seña paga dice que no hay nada para devolver', async () => {
    vi.setSystemTime(hoursBefore(30))
    const { user } = setup({ paymentStatus: 'pending' })

    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))
    expect(screen.getByRole('status')).toHaveTextContent('No hay seña paga para devolver.')
  })

  it('envía cancelledBy, clientNoticeAt, noticeChannel y noticeNote', async () => {
    vi.setSystemTime(hoursBefore(20))
    const { user, onConfirm, onDone } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    fireEvent.change(noticeInput(), { target: { value: '2026-11-02T18:30' } })
    await user.selectOptions(screen.getByLabelText('Medio por el que avisó (opcional)'), 'whatsapp')
    await user.type(screen.getByLabelText('Nota (opcional)'), '  Tiene un viaje  ')
    await user.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith({
      cancelledBy:    'client',
      clientNoticeAt: '2026-11-02T21:30:00.000Z', // 18:30 ART
      noticeChannel:  'whatsapp',
      noticeNote:     'Tiene un viaje',
    })
    expect(onDone).toHaveBeenCalled()
  })

  it('sin medio ni nota solo manda cancelledBy y clientNoticeAt', async () => {
    vi.setSystemTime(new Date('2026-11-02T10:30:45-03:00'))
    const { user, onConfirm } = setup()
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))
    await user.click(confirmButton())

    expect(onConfirm).toHaveBeenCalledWith({ cancelledBy: 'client', clientNoticeAt: '2026-11-02T13:30:00.000Z' })
  })

  it('la profesional no puede cargar un aviso de más de 48 horas: indica que lo carga la administradora', async () => {
    vi.setSystemTime(hoursBefore(10))
    const { user, onConfirm } = setup({ role: 'professional' })
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    fireEvent.change(noticeInput(), { target: { value: '2026-10-31T10:00' } }) // más de 48 h atrás
    expect(screen.getByRole('alert')).toHaveTextContent('lo tiene que cargar la administradora')
    expect(confirmButton()).toBeDisabled()
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.change(noticeInput(), { target: { value: '2026-11-02T10:00' } }) // menos de 48 h
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()
  })

  it('la administradora sí puede cargar un aviso de más de 48 horas', async () => {
    vi.setSystemTime(hoursBefore(10))
    const { user } = setup({ role: 'admin' })
    await user.click(screen.getByRole('radio', { name: /La clienta avisó/ }))

    fireEvent.change(noticeInput(), { target: { value: '2026-10-31T10:00' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(confirmButton()).toBeEnabled()
  })

  it('si el servidor rechaza la cancelación muestra el mensaje y no cierra', async () => {
    vi.setSystemTime(hoursBefore(20))
    const onConfirm = vi.fn().mockResolvedValue('Un aviso de hace más de 48 horas lo tiene que cargar la administradora.')
    const { user, onDone } = setup({ onConfirm })
    await user.click(screen.getByRole('radio', { name: /El estudio cancela/ }))
    await user.click(confirmButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('lo tiene que cargar la administradora')
    expect(onDone).not.toHaveBeenCalled()
  })

  it('«Volver» cierra sin cancelar', async () => {
    vi.setSystemTime(hoursBefore(20))
    const { user, onClose, onConfirm } = setup()
    await user.click(screen.getByRole('button', { name: 'Volver' }))

    expect(onClose).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
