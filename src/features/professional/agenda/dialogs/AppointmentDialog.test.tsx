import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentDialog } from './AppointmentDialog'
import type { Appointment } from '@/features/professional/types/appointment'

vi.mock('@/shared/hooks/usePaymentRules', () => ({
  usePaymentRules: () => ({ cancellationHours: 12, refundPolicy: 'full' }),
}))

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
    onChangeStatus,
    onCancel: vi.fn().mockResolvedValue(null),
    onReschedule: vi.fn().mockResolvedValue(null),
    onMarkDepositPaid: vi.fn().mockResolvedValue(null),
  }
  render(<AppointmentDialog {...props} />)
  return { ...props, user: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }) }
}

describe('AppointmentDialog (profesional): inasistencia', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('«Marcar estado» ofrece las cinco opciones y abajo solo queda «Editar»', () => {
    vi.setSystemTime(START)
    setup()

    for (const name of ['Cancelar', 'Reprogramar', 'Finalizado', 'No asistió']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('checkbox', { name: /Seña pagada/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirmado' })).not.toBeInTheDocument()
  })

  it('desde la hora de inicio marca «No asistió» después de confirmar y cierra el diálogo', async () => {
    vi.setSystemTime(new Date(START.getTime() + 10 * 60_000))
    const { user, onChangeStatus, onClose, appointment } = setup()

    await user.click(screen.getByRole('button', { name: 'No asistió' }))
    expect(screen.getByText(/Se abrirá un horario nuevo desde ahora/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, marcar «No asistió»' }))

    expect(onChangeStatus).toHaveBeenCalledWith(appointment, 'cancelled_no_show')
    expect(onClose).toHaveBeenCalled()
  })

  it('antes de la hora de inicio no se puede marcar', () => {
    vi.setSystemTime(new Date(START.getTime() - 60_000))
    setup()

    expect(screen.getByRole('button', { name: 'No asistió' })).toBeDisabled()
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

  it('«Cancelar turno» abre el diálogo de cancelación y manda quién cancela', async () => {
    vi.setSystemTime(new Date(START.getTime() - 20 * 3_600_000))
    const { user, onCancel, onClose, appointment } = setup()

    // «Cancelado» ya no es una opción del selector de estado.
    expect(screen.queryByRole('button', { name: 'Cancelado' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await user.click(screen.getByRole('radio', { name: /El estudio cancela/ }))
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar el turno' }))

    expect(onCancel).toHaveBeenCalledWith(appointment, { cancelledBy: 'studio' })
    expect(onClose).toHaveBeenCalled()
  })

  it('un turno finalizado o con «No asistió» no ofrece cancelar', () => {
    vi.setSystemTime(START)
    setup({ status: 'finished' })

    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
  })

  it('ya no hay «Marcar llegada» en el detalle: lo reemplaza «Finalizado»', () => {
    vi.setSystemTime(START)
    setup()

    expect(screen.queryByRole('button', { name: /Marcar llegada/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Todavía no registró la llegada/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Finalizado' })).toBeInTheDocument()
  })
})

describe('AppointmentDialog (profesional): datos de la clienta y de lo que completó', () => {
  it.each([['vacía', ''], ['null', null], ['ausente', undefined]])('con alergia %s no aparece ningún texto de alergia', (_n, allergies) => {
    setup({ client: { ...base.client, allergies } as Appointment['client'] })
    expect(screen.queryByText(/Sin alergias para mostrar/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Alergias/)).not.toBeInTheDocument()
  })

  it('con alergia cargada la muestra como «Alergias: …»', () => {
    setup({ client: { ...base.client, allergies: 'Látex' } })
    expect(screen.getByText('Alergias: Látex')).toBeInTheDocument()
  })

  it('sin ningún dato de la clienta no aparece la sección «Datos del cliente»', () => {
    setup({ client: { ...base.client, phone: '', email: '', allergies: '', notes: '' } })
    expect(screen.queryByText('Datos del cliente')).not.toBeInTheDocument()
  })

  it('con correo vacío (turno manual sin correo) no se muestra ninguna dirección', () => {
    setup({ client: { ...base.client, email: '' } })
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
    expect(screen.getByText('3764000000')).toBeInTheDocument()
  })

  it('si la clienta no completó el formulario del turno no aparece «Info del turno»', () => {
    setup({ details: { allergies: null, hasCompanion: false, companionRelation: null, designPreference: null } })
    expect(screen.queryByText('Info del turno')).not.toBeInTheDocument()
  })

  it('si lo completó, aparece poca información y solo lo cargado: «Alergias: …», «Acompañante: sí (…)»', () => {
    setup({ details: { allergies: 'Polen', hasCompanion: true, companionRelation: 'child', designPreference: null } })
    expect(screen.getByText('Info del turno')).toBeInTheDocument()
    expect(screen.getByText(/Alergias:/, { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('Polen', { exact: false })).toBeInTheDocument()
    expect(screen.getByText(/Acompañante:/, { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText(/sí \(hija\/hijo\)/)).toBeInTheDocument()
    expect(screen.queryByText(/Extensiones|Largo de cabello|Tipo de piel/)).not.toBeInTheDocument()
  })

  it('el cobro registrado no dice «registrado por …» y se puede corregir el monto, más o menos', async () => {
    const onRegister = vi.fn().mockResolvedValue(null)
    render(
      <AppointmentDialog
        appointment={{ ...base, paymentStatus: 'paid', servicePrice: 50000, depositAmount: 5000, balancePayment: { method: 'cash', amount: 45000, collectedByName: 'Profesional D' } }}
        primary="#069494" accent="#d4af37" onClose={vi.fn()} onSave={vi.fn()}
        onChangeStatus={vi.fn().mockResolvedValue(null)} onCancel={vi.fn().mockResolvedValue(null)}
        onRegisterBalancePayment={onRegister}
      />,
    )
    const user = userEvent.setup()

    expect(screen.getByText(/Saldo cobrado en el local: \$45\.000 en Efectivo/)).toBeInTheDocument()
    expect(screen.queryByText(/registrado por/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Corregir monto' }))
    const amount = screen.getByLabelText('Monto cobrado')
    await user.clear(amount)
    await user.type(amount, '52000')
    await user.click(screen.getByRole('button', { name: 'Guardar monto' }))

    expect(onRegister).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }), { method: 'cash', amount: 52000, replace: true })
  })
})

describe('AppointmentDialog (profesional): cobro en el local y cambio de profesional en combos', () => {
  function setupExtras(appointment: Partial<Appointment>) {
    const onRegisterBalancePayment = vi.fn().mockResolvedValue(null)
    const onChangeProfessional = vi.fn().mockResolvedValue(null)
    render(
      <AppointmentDialog
        appointment={{ ...base, ...appointment }} primary="#069494" accent="#d4af37"
        onClose={vi.fn()} onSave={vi.fn()}
        onChangeStatus={vi.fn().mockResolvedValue(null)} onCancel={vi.fn().mockResolvedValue(null)}
        onRegisterBalancePayment={onRegisterBalancePayment}
        colleagues={[{ id: 'p2', name: 'Marina' }]} onChangeProfessional={onChangeProfessional}
      />,
    )
    return { onRegisterBalancePayment, onChangeProfessional, user: userEvent.setup() }
  }

  it('la profesional registra el cobro de su turno con la forma de pago y el monto sugerido', async () => {
    const { onRegisterBalancePayment, user } = setupExtras({ paymentStatus: 'partial', depositAmount: 3000 })

    expect(screen.getByLabelText('Monto cobrado')).toHaveValue(7000)
    await user.selectOptions(screen.getByLabelText('Forma de pago'), 'card')
    await user.click(screen.getByRole('button', { name: 'Registrar cobro' }))

    expect(onRegisterBalancePayment).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }), { method: 'card', amount: 7000 })
  })

  it('en un servicio de combo puede pasarlo a otra profesional; en un turno suelto no aparece', async () => {
    const { onChangeProfessional, user } = setupExtras({ paymentStatus: 'pending', comboGroupId: 'g1' })

    await user.selectOptions(screen.getByLabelText('Nueva profesional'), 'p2')
    await user.click(screen.getByRole('button', { name: 'Cambiar' }))
    expect(onChangeProfessional).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }), 'p2')
  })

  it('un turno que no es de combo no ofrece cambiar la profesional', () => {
    setupExtras({ paymentStatus: 'pending', comboGroupId: null })
    expect(screen.queryByLabelText('Nueva profesional')).not.toBeInTheDocument()
  })
})
