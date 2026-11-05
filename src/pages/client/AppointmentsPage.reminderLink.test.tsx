import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AppointmentsPage } from './AppointmentsPage'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}))
vi.mock('@/features/tenant/TenantContext', () => ({
  useTenant: () => ({
    business: {
      primaryColor: '#069494', accentColor: '#d4af37', whatsapp: '',
      policies: [], contactInfo: { address: 'Calle 123', phone: '', email: '', schedule: '' },
    },
  }),
}))
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Ana Pérez', role: 'client' } }),
  isFirstVisit: () => false,
}))
// El flujo de reprogramación pide servicios, profesionales y horarios: acá solo importa QUE se abre y que no guarda nada.
vi.mock('@/features/client/booking/RescheduleModal', () => ({
  RescheduleModal: ({ appointmentId }: { appointmentId: string }) => (
    <div role="dialog" aria-label="Reprogramar turno">Reprogramando {appointmentId}</div>
  ),
}))

// Mediodía del 3/11/2026 en Argentina; los turnos de prueba son ese mismo día más tarde.
const NOW = new Date('2026-11-03T10:00:00-03:00')

const appointment = (extra: Record<string, unknown> = {}) => ({
  id: 'a1', serviceId: 's1', serviceName: 'Corte', categoryId: 'cabello',
  professionalId: 'p1', professionalName: 'Lucía',
  date: '2026-11-03', time: '16:00', duration: 60, price: 10000, depositAmount: 3000,
  status: 'confirmed', paymentStatus: 'paid',
  ...extra,
})
type Appt = ReturnType<typeof appointment>

function mockServer(list: Appt[], opts: { failList?: boolean } = {}) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/client/appointments') {
      return (opts.failList ? Promise.reject(new Error('boom')) : Promise.resolve({ data: { appointments: list } })) as never
    }
    if (url === '/api/business/payments/public') {
      return Promise.resolve({ data: { settings: { depositAmount: 3000, depositPercent: false, cancellationHours: 12, refundPolicy: 'full' } } }) as never
    }
    return Promise.resolve({ data: { pending: [] } }) as never
  })
  vi.mocked(api.patch).mockResolvedValue({ data: { appointment: appointment({ status: 'cancelled' }), refunded: true } } as never)
}

function Where() {
  const { pathname, search } = useLocation()
  return <p data-testid="where">{pathname}{search}</p>
}

function renderLink(search: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/client/appointments${search}`]}>
        <AppointmentsPage />
        <Where />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return userEvent.setup()
}

const CANCEL_TITLE = '¿Cancelar este turno?'
const patchCalls = () => vi.mocked(api.patch).mock.calls

describe('Mis turnos: enlaces del mail de recordatorio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })
  afterEach(() => { vi.useRealTimers() })

  describe('cada acción abre su pantalla y pide confirmación', () => {
    it('accion=ver abre el detalle del turno y no modifica nada', async () => {
      mockServer([appointment()])
      renderLink('?turno=a1&accion=ver')

      expect(await screen.findByText('Resta pagar el día del turno')).toBeInTheDocument()
      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()
      expect(patchCalls()).toHaveLength(0)
    })

    it('accion=cancelar abre la confirmación con el resultado de la seña y NO cancela por sí sola', async () => {
      mockServer([appointment()])
      renderLink('?turno=a1&accion=cancelar')

      expect(await screen.findByText(CANCEL_TITLE)).toBeInTheDocument()
      // Son las 10:00 y el turno es a las 16:00: faltan 6 h y el plazo para recuperar la seña es de 12 h.
      expect(await screen.findByText(/Faltan 6 h 0 min para el turno.*la seña queda retenida/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sí, cancelar' })).toBeEnabled()
      expect(patchCalls()).toHaveLength(0)
    })

    it('«Volver» cierra la confirmación sin cancelar', async () => {
      mockServer([appointment()])
      const user = renderLink('?turno=a1&accion=cancelar')

      await user.click(await screen.findByRole('button', { name: 'Volver' }))

      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()
      expect(patchCalls()).toHaveLength(0)
    })

    it('recién al tocar «Sí, cancelar» se cancela el turno', async () => {
      mockServer([appointment()])
      const user = renderLink('?turno=a1&accion=cancelar')

      await user.click(await screen.findByRole('button', { name: 'Sí, cancelar' }))

      await waitFor(() => expect(patchCalls()).toEqual([['/api/client/appointments/a1/cancel']]))
    })

    it('accion=reprogramar abre el flujo de reprogramación sin guardar ningún cambio', async () => {
      mockServer([appointment()])
      renderLink('?turno=a1&accion=reprogramar')

      expect(await screen.findByRole('dialog', { name: 'Reprogramar turno' })).toHaveTextContent('Reprogramando a1')
      expect(patchCalls()).toHaveLength(0)
    })

    it('una acción desconocida cae en «ver», que no pide ni hace nada más', async () => {
      mockServer([appointment()])
      renderLink('?turno=a1&accion=borrar')

      expect(await screen.findByText('Resta pagar el día del turno')).toBeInTheDocument()
      expect(patchCalls()).toHaveLength(0)
    })

    it('después de abrir, saca los parámetros de la URL para que recargar no vuelva a abrirlo', async () => {
      mockServer([appointment()])
      renderLink('?turno=a1&accion=ver')

      await screen.findByText('Resta pagar el día del turno')
      await waitFor(() => expect(screen.getByTestId('where')).toHaveTextContent(/^\/client\/appointments$/))
    })

    it('sin enlace no se abre nada', async () => {
      mockServer([appointment()])
      renderLink('')

      expect(await screen.findByText('Corte')).toBeInTheDocument()
      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()
      expect(screen.queryByText('Resta pagar el día del turno')).not.toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('casos de borde: mensaje claro y la lista normal', () => {
    async function expectNotice(search: string, list: Appt[], text: RegExp) {
      mockServer(list)
      renderLink(search)
      expect(await screen.findByRole('status')).toHaveTextContent(text)
      // La lista normal sigue ahí.
      expect(screen.getByRole('button', { name: 'Próximos' })).toBeInTheDocument()
      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(patchCalls()).toHaveLength(0)
    }

    it('turno que no existe', async () => {
      await expectNotice('?turno=zzz&accion=cancelar', [appointment()], /No encontramos ese turno en tu cuenta/)
    })

    it('turno de otra clienta: el servidor no lo devuelve y se dice lo mismo que si no existiera', async () => {
      await expectNotice('?turno=ajeno-1&accion=ver', [appointment({ id: 'mio-1' })], /No encontramos ese turno en tu cuenta/)
    })

    it('turno que ya empezó', async () => {
      await expectNotice('?turno=a1&accion=cancelar', [appointment({ time: '09:30' })], /ya empezó/)
    })

    it('«No asistió (automático)» explica que no se puede cancelar ni reprogramar', async () => {
      await expectNotice('?turno=a1&accion=reprogramar', [appointment({ status: 'no_show_auto', time: '09:30' })], /No se puede cancelar ni reprogramar/)
    })

    it('turno ya cancelado', async () => {
      await expectNotice('?turno=a1&accion=cancelar', [appointment({ status: 'cancelled' })], /ya está cancelado/)
    })

    it('turno ya realizado', async () => {
      await expectNotice('?turno=a1&accion=ver', [appointment({ status: 'finished' })], /ya se realizó/)
    })

    it('combo con accion=reprogramar: se explica que no se puede reprogramar', async () => {
      await expectNotice(
        '?turno=a1&accion=reprogramar',
        [appointment({ comboGroupId: 'g1' }), appointment({ id: 'a2', serviceName: 'Brushing', comboGroupId: 'g1' })],
        /parte de un combo y no se puede reprogramar/,
      )
    })

    it('si no se pudieron cargar los turnos, lo dice en vez de afirmar que el turno no existe', async () => {
      mockServer([], { failList: true })
      renderLink('?turno=a1&accion=ver')

      const notice = await screen.findByRole('status')
      expect(notice).toHaveTextContent(/No pudimos cargar tus turnos/)
      expect(notice).not.toHaveTextContent(/No encontramos/)
    })

    it('el aviso se puede cerrar', async () => {
      mockServer([appointment()])
      const user = renderLink('?turno=zzz&accion=ver')

      await user.click(await screen.findByRole('button', { name: 'Cerrar aviso' }))

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('un turno con parámetros inválidos en la URL no abre nada', async () => {
      mockServer([appointment()])
      renderLink('?turno=%3Cscript%3E&accion=cancelar')

      expect(await screen.findByText('Corte')).toBeInTheDocument()
      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('combos', () => {
    const legs = () => [
      appointment({ comboGroupId: 'g1' }),
      appointment({ id: 'a2', serviceName: 'Brushing', professionalName: 'Marta', comboGroupId: 'g1' }),
    ]

    it('accion=cancelar sobre un combo avisa que se cancelan todos los servicios y no cancela hasta confirmar', async () => {
      mockServer(legs())
      renderLink('?turno=a1&accion=cancelar')

      expect(await screen.findByText(CANCEL_TITLE)).toBeInTheDocument()
      expect(screen.getByText(/se van a cancelar todos los servicios del combo/)).toBeInTheDocument()
      expect(patchCalls()).toHaveLength(0)
    })

    it('si la primera pata (la del enlace) ya está cancelada pero otra sigue en pie, abre el combo con esa', async () => {
      mockServer([appointment({ status: 'cancelled', comboGroupId: 'g1' }), ...legs().slice(1)])
      renderLink('?turno=a1&accion=ver')

      expect(await screen.findByText('Resta pagar el día del turno')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Brushing', level: 2 })).toBeInTheDocument()
    })

    it('si todas las patas están canceladas, dice que ya está cancelado', async () => {
      mockServer(legs().map(l => ({ ...l, status: 'cancelled' })))
      renderLink('?turno=a1&accion=cancelar')

      expect(await screen.findByRole('status')).toHaveTextContent(/ya está cancelado/)
    })
  })

  describe('avisos que salen al entrar', () => {
    it('espera a que se cierre el aviso de turno reprogramado antes de abrir el turno del enlace', async () => {
      mockServer([
        appointment({ id: 'otro', serviceName: 'Manicura', rescheduleNoticePending: true, previousDate: '2026-11-02', previousTime: '10:00' }),
        appointment(),
      ])
      const user = renderLink('?turno=a1&accion=cancelar')

      expect(await screen.findByText('Tu turno se reprogramó')).toBeInTheDocument()
      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Aceptar' }))

      expect(await screen.findByText(CANCEL_TITLE)).toBeInTheDocument()
      expect(patchCalls().map(c => c[0])).not.toContain('/api/client/appointments/a1/cancel')
    })
  })

  describe('hora de Argentina cerca de las 21:00', () => {
    it('un turno de las 21:00: a las 20:59 el enlace lo abre', async () => {
      vi.setSystemTime(new Date('2026-11-03T20:59:00-03:00'))
      mockServer([appointment({ time: '21:00' })])
      renderLink('?turno=a1&accion=cancelar')

      expect(await screen.findByText(CANCEL_TITLE)).toBeInTheDocument()
    })

    it('un turno de las 21:00: a las 21:00 en punto ya empezó y el enlace no lo abre', async () => {
      vi.setSystemTime(new Date('2026-11-03T21:00:00-03:00'))
      mockServer([appointment({ time: '21:00' })])
      renderLink('?turno=a1&accion=cancelar')

      expect(await screen.findByRole('status')).toHaveTextContent(/ya empezó/)
      expect(screen.queryByText(CANCEL_TITLE)).not.toBeInTheDocument()
    })
  })
})
