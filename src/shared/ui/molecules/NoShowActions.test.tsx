import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NoShowActions } from './NoShowActions'

// Los turnos son hora de Argentina (UTC-3): 16:00 ART = 19:00 UTC.
const DATE = '2026-11-03'
const TIME = '16:00'
const at = (hhmmART: string) => new Date(`${DATE}T${hhmmART}:00-03:00`)

function setup(props: Partial<React.ComponentProps<typeof NoShowActions>> = {}) {
  const onChangeStatus = vi.fn().mockResolvedValue(null)
  const onDone = vi.fn()
  render(
    <NoShowActions status="confirmed" date={DATE} time={TIME} accent="#069494" onChangeStatus={onChangeStatus} onDone={onDone} {...props} />,
  )
  return { onChangeStatus, onDone, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) }
}

describe('NoShowActions', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  describe('Marcar No asistió', () => {
    it('antes de la hora de inicio el botón está deshabilitado y avisa por qué', () => {
      vi.setSystemTime(at('15:59'))
      setup()

      expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeDisabled()
      expect(screen.getByText(/desde la hora de inicio/)).toBeInTheDocument()
    })

    it('desde la hora de inicio se puede marcar', () => {
      vi.setSystemTime(at('16:00'))
      setup()

      expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeEnabled()
    })

    it('hasta 40 minutos después explica que se abrirá un horario nuevo desde ahora', async () => {
      vi.setSystemTime(at('16:40'))
      const { user } = setup()

      await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))

      expect(screen.getByText(/Se abrirá un horario nuevo desde ahora/)).toBeInTheDocument()
      expect(screen.queryByText(/no se abre horario nuevo/)).not.toBeInTheDocument()
    })

    it('pasados 40 minutos explica que no se abre horario nuevo', async () => {
      vi.setSystemTime(at('16:41'))
      const { user } = setup()

      await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))

      expect(screen.getByText(/Pasaron más de 40 minutos: no se abre horario nuevo/)).toBeInTheDocument()
      expect(screen.queryByText(/Se abrirá un horario nuevo/)).not.toBeInTheDocument()
    })

    it('no cambia nada hasta confirmar; al confirmar manda cancelled_no_show y avisa que terminó', async () => {
      vi.setSystemTime(at('16:20'))
      const { user, onChangeStatus, onDone } = setup()

      await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))
      expect(onChangeStatus).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'Sí, marcar «No asistió»' }))

      expect(onChangeStatus).toHaveBeenCalledWith('cancelled_no_show')
      expect(onDone).toHaveBeenCalled()
    })

    it('«Volver» descarta la confirmación sin cambiar nada', async () => {
      vi.setSystemTime(at('16:20'))
      const { user, onChangeStatus } = setup()

      await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))
      await user.click(screen.getByRole('button', { name: 'Volver' }))

      expect(onChangeStatus).not.toHaveBeenCalled()
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeInTheDocument()
    })

    it('si el servidor lo rechaza muestra el mensaje y no da el cambio por hecho', async () => {
      vi.setSystemTime(at('16:20'))
      const onChangeStatus = vi.fn().mockResolvedValue('No se puede marcar «No asistió» un turno que todavía no empezó.')
      const { user, onDone } = setup({ onChangeStatus })

      await user.click(screen.getByRole('button', { name: 'Marcar No asistió' }))
      await user.click(screen.getByRole('button', { name: 'Sí, marcar «No asistió»' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('todavía no empezó')
      expect(onDone).not.toHaveBeenCalled()
    })

    it('un turno marcado automáticamente también se puede marcar como No asistió', () => {
      vi.setSystemTime(at('16:35'))
      setup({ status: 'no_show_auto' })

      expect(screen.getByRole('button', { name: 'Marcar No asistió' })).toBeEnabled()
    })
  })

  describe('Corregir: la clienta vino', () => {
    it.each(['no_show_auto', 'cancelled_no_show'])('con el turno en %s ofrece corregir a Finalizado o a Confirmado', status => {
      vi.setSystemTime(at('18:00'))
      setup({ status })

      expect(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Finalizado)' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Confirmado)' })).toBeInTheDocument()
    })

    it('corrige a Finalizado después de una confirmación que explica el efecto', async () => {
      vi.setSystemTime(at('18:00'))
      const { user, onChangeStatus, onDone } = setup({ status: 'cancelled_no_show' })

      await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Finalizado)' }))
      expect(screen.getByText(/Si se había abierto un horario nuevo y nadie lo reservó, se cierra/)).toBeInTheDocument()
      expect(onChangeStatus).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

      expect(onChangeStatus).toHaveBeenCalledWith('finished')
      expect(onDone).toHaveBeenCalled()
    })

    it('corrige a Confirmado y aclara que no puede superponerse con otro turno', async () => {
      vi.setSystemTime(at('18:00'))
      const { user, onChangeStatus } = setup({ status: 'no_show_auto' })

      await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Confirmado)' }))
      expect(screen.getByText(/no se superpone con otro turno/)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

      expect(onChangeStatus).toHaveBeenCalledWith('confirmed')
    })

    it('si el turno se superpone, el mensaje del servidor queda a la vista', async () => {
      vi.setSystemTime(at('18:00'))
      const onChangeStatus = vi.fn().mockResolvedValue('No se puede confirmar: el turno se superpone con otro turno de la profesional.')
      const { user, onDone } = setup({ status: 'no_show_auto', onChangeStatus })

      await user.click(screen.getByRole('button', { name: 'Corregir: la clienta vino (a Confirmado)' }))
      await user.click(screen.getByRole('button', { name: 'Sí, corregir' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('se superpone con otro turno')
      expect(onDone).not.toHaveBeenCalled()
    })

    it('no ofrece corregir en un turno confirmado', () => {
      vi.setSystemTime(at('18:00'))
      setup({ status: 'confirmed' })

      expect(screen.queryByRole('button', { name: /Corregir/ })).not.toBeInTheDocument()
    })
  })

  it.each(['finished', 'cancelled', 'pending'])('no muestra ninguna acción con el turno en %s', status => {
    vi.setSystemTime(at('18:00'))
    setup({ status })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
