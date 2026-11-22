import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkStatusPanel } from './MarkStatusPanel'

// 16:00 ART del 03/11/2026
const START = new Date('2026-11-03T16:00:00-03:00')

function setup(extra: Partial<React.ComponentProps<typeof MarkStatusPanel>> = {}, now: Date = new Date(START.getTime() + 5 * 60_000)) {
  vi.setSystemTime(now)
  const props = {
    status: 'confirmed', date: '2026-11-03', time: '16:00', accent: '#069494',
    paymentStatus: 'pending', depositAmount: 3000, depositMethod: 'whatsapp' as string | null,
    onRequestCancel: vi.fn(),
    onReschedule: vi.fn().mockResolvedValue(null),
    onFinish: vi.fn().mockResolvedValue(null),
    onNoShow: vi.fn().mockResolvedValue(null),
    onMarkDepositPaid: vi.fn().mockResolvedValue(null),
    onDone: vi.fn(),
    ...extra,
  }
  render(<MarkStatusPanel {...props} />)
  return { ...props, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) }
}

describe('Marcar estado', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('solo se ofrece en turnos que todavía no se realizaron', () => {
    for (const status of ['finished', 'cancelled', 'cancelled_no_show', 'no_show_auto']) {
      setup({ status })
      expect(screen.queryByRole('region', { name: 'Marcar estado' })).not.toBeInTheDocument()
      document.body.innerHTML = ''
    }
  })

  it('antes de la hora de inicio «Finalizado» y «No asistió» están apagados, pero cancelar y reprogramar no', () => {
    setup({}, new Date(START.getTime() - 60 * 60_000))

    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'No asistió' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Reprogramar' })).toBeEnabled()
  })

  it('con el turno ya empezado todo se puede, y «Cancelar» abre el diálogo de cancelación', async () => {
    const { user, onRequestCancel } = setup()

    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'No asistió' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onRequestCancel).toHaveBeenCalledTimes(1)
  })

  it('seña por Mercado Pago ya pagada: queda tildada y no se puede cambiar', () => {
    setup({ paymentStatus: 'partial', depositMethod: null })

    const box = screen.getByRole('checkbox', { name: /Seña pagada/ })
    expect(box).toBeChecked()
    expect(box).toBeDisabled()
  })

  it('seña por Mercado Pago sin pagar: no se tilda a mano (se marca sola)', () => {
    setup({ paymentStatus: 'pending', depositMethod: null })

    expect(screen.getByRole('checkbox', { name: /Seña pagada/ })).toBeDisabled()
  })

  it('seña por WhatsApp pendiente: se tilda, se marca paga y el diálogo no se cierra', async () => {
    const { user, onMarkDepositPaid, onDone } = setup()

    const box = screen.getByRole('checkbox', { name: /Seña pagada/ })
    expect(box).not.toBeChecked()
    await user.click(box)

    expect(onMarkDepositPaid).toHaveBeenCalledTimes(1)
    expect(onDone).not.toHaveBeenCalled()
  })

  it('sin seña no se muestra «Seña pagada»', () => {
    setup({ depositAmount: 0, paymentStatus: 'pending' })

    expect(screen.queryByRole('checkbox', { name: /Seña pagada/ })).not.toBeInTheDocument()
  })

  it('solo una de las otras cuatro a la vez: elegir «Finalizado» y después «Reprogramar» deja marcada solo la segunda', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Finalizado' }))
    expect(screen.getByRole('button', { name: 'Finalizado' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))

    expect(screen.getByRole('button', { name: 'Reprogramar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Finalizado' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('«Reprogramar» mueve el turno a la fecha y hora elegidas, aunque ya haya empezado, y cierra', async () => {
    const { user, onReschedule, onDone } = setup()

    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    const confirm = screen.getByRole('button', { name: 'Confirmar reprogramación' })
    expect(confirm).toBeDisabled() // misma fecha y hora: nada que mover
    fireEvent.change(document.querySelector('input[type="date"]') as HTMLInputElement, { target: { value: '2026-11-10' } })
    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '11:30' } })
    await user.click(screen.getByRole('button', { name: 'Confirmar reprogramación' }))

    expect(onReschedule).toHaveBeenCalledWith('2026-11-10', '11:30')
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('si el servidor rechaza el cambio muestra el mensaje y no cierra', async () => {
    const { user, onDone } = setup({ onReschedule: vi.fn().mockResolvedValue('Ese horario ya no está disponible.') })

    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    fireEvent.change(document.querySelector('input[type="time"]') as HTMLInputElement, { target: { value: '11:30' } })
    await user.click(screen.getByRole('button', { name: 'Confirmar reprogramación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ese horario ya no está disponible.')
    expect(onDone).not.toHaveBeenCalled()
  })

  it('«Finalizado» y «No asistió» piden confirmación antes de aplicar', async () => {
    const { user, onFinish, onNoShow } = setup()

    await user.click(screen.getByRole('button', { name: 'Finalizado' }))
    expect(onFinish).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Sí, marcar finalizado' }))
    expect(onFinish).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'No asistió' }))
    expect(onNoShow).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Sí, marcar «No asistió»' }))
    expect(onNoShow).toHaveBeenCalledTimes(1)
  })
})
