import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpecialEventsSection } from './SpecialEventsSection'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))
vi.mock('@/shared/ui/molecules/ToastProvider', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

const event = (id: string, date: string) => ({
  id, date, title: `Evento ${id}`, description: '', active: true,
  service: { id: 's1', name: 'Depilación' }, professional: { id: 'p1', name: 'Lucía' },
})

function mockEvents(list: ReturnType<typeof event>[]) {
  vi.mocked(api.get).mockImplementation((url: string) => {
    if (url === '/api/admin/special-events') return Promise.resolve({ data: { specialEvents: list } }) as never
    if (url === '/api/services') return Promise.resolve({ data: { services: [] } }) as never
    return Promise.resolve({ data: { professionals: [] } }) as never
  })
}

describe('Eventos especiales: «hoy» es el día de Argentina', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
  })
  afterEach(() => { vi.useRealTimers() })

  it('a las 21:30 un evento de hoy no figura como pasado', async () => {
    vi.setSystemTime(new Date('2026-10-31T21:30:00-03:00')) // 00:30 UTC del 1/11
    mockEvents([event('hoy', '2026-10-31'), event('ayer', '2026-10-30')])
    render(<SpecialEventsSection />)

    expect(await screen.findByText('Evento hoy')).toBeInTheDocument()
    expect(screen.getAllByText(/ya pasó, no se ve en el home/)).toHaveLength(1)
    expect(screen.getByText(/2026-10-30 — ya pasó/)).toBeInTheDocument()
    expect(screen.queryByText(/2026-10-31 — ya pasó/)).not.toBeInTheDocument()
  })

  it('un evento figura como pasado recién cuando termina el día de Argentina', async () => {
    vi.setSystemTime(new Date('2026-11-01T00:01:00-03:00'))
    mockEvents([event('ayer', '2026-10-31')])
    render(<SpecialEventsSection />)

    expect(await screen.findByText(/2026-10-31 — ya pasó/)).toBeInTheDocument()
  })

  it('el campo «Fecha del evento» no deja elegir días anteriores a hoy (Argentina) ni siquiera a las 21:30', async () => {
    vi.setSystemTime(new Date('2026-10-31T21:30:00-03:00'))
    mockEvents([])
    const user = userEvent.setup({ advanceTimers: () => {} })
    render(<SpecialEventsSection />)

    await user.click(await screen.findByRole('button', { name: /Nuevo evento especial/ }))

    const input = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(input.min).toBe('2026-10-31')
  })
})
