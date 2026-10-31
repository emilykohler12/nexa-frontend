import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientDetail } from './ClientDetail'
import { ToastProvider } from '@/shared/ui/molecules/ToastProvider'
import type { AdminClient } from './types'

vi.mock('./tabs/HistoryTab', () => ({ HistoryTab: () => null }))
vi.mock('./tabs/GalleryTab', () => ({ GalleryTab: () => null }))
vi.mock('./tabs/ReviewsTab', () => ({ ReviewsTab: () => null }))

const client: AdminClient = {
  id: 'c1', name: 'Ana Pérez', photo: null, phone: '3764000000', email: 'ana@test.local',
  gender: null,
  clinical: { allergies: '', preferences: '', observations: '' },
  visits: { totalVisits: 0, totalSpent: 0, lastVisit: null },
  createdAt: '2026-01-01T00:00:00.000Z',
}

function setup(props: { onAnonymize?: (c: AdminClient) => Promise<void>; client?: AdminClient } = {}) {
  const onAnonymize = props.onAnonymize ?? vi.fn().mockResolvedValue(undefined)
  render(
    <ToastProvider>
      <ClientDetail
        client={props.client ?? client}
        onBack={vi.fn()}
        onSave={vi.fn()}
        onToggleBlock={vi.fn()}
        onAnonymize={onAnonymize}
      />
    </ToastProvider>,
  )
  return { onAnonymize }
}

// El backend devuelve `visits` (solo turnos finalizados); ya no hay puntos ni fecha de nacimiento.
describe('ClientDetail: visitas de la clienta', () => {
  const withVisits: AdminClient = {
    ...client,
    visits: { totalVisits: 7, totalSpent: 84500, lastVisit: '2026-10-15' },
  }

  it('muestra las visitas, lo gastado y la última visita', () => {
    setup({ client: withVisits })

    const visits = screen.getByRole('region', { name: 'Visitas' })
    expect(within(visits).getByText('Total de visitas')).toBeInTheDocument()
    expect(within(visits).getByText('7')).toBeInTheDocument()
    expect(within(visits).getByText(`$${(84500).toLocaleString('es-AR')}`)).toBeInTheDocument()
    expect(within(visits).getByText(/15 de octubre de 2026/)).toBeInTheDocument()
  })

  it('sin turnos finalizados muestra ceros y la última visita vacía', () => {
    setup()

    const visits = screen.getByRole('region', { name: 'Visitas' })
    expect(within(visits).getByText('0')).toBeInTheDocument()
    expect(within(visits).getByText('—')).toBeInTheDocument()
  })

  it('no muestra puntos, fidelización ni fecha de nacimiento', async () => {
    const user = userEvent.setup()
    setup({ client: withVisits })

    // Pestaña de datos personales (la que abre por defecto) y el resto de las pestañas.
    expect(screen.getByText('Datos personales')).toBeInTheDocument()
    expect(screen.queryByText(/fecha de nacimiento/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Fidelización' })).not.toBeInTheDocument()
    expect(screen.queryByText(/puntos|fidelizaci|campañas?/i)).not.toBeInTheDocument()

    for (const name of ['Historial', 'Galería', 'Reseñas']) {
      await user.click(screen.getByRole('button', { name }))
      expect(screen.queryByText(/puntos|fidelizaci|campañas?|fecha de nacimiento/i)).not.toBeInTheDocument()
    }
  })
})

// RF-09 — la propietaria anonimiza los datos de una clienta desde el panel.
describe('ClientDetail: anonimizar datos de la clienta', () => {
  it('pide confirmación y no anonimiza hasta que se confirma', async () => {
    const user = userEvent.setup()
    const { onAnonymize } = setup()

    await user.click(screen.getByRole('button', { name: 'Anonimizar datos' }))
    expect(screen.getByText('¿Anonimizar los datos de esta clienta?')).toBeInTheDocument()
    expect(onAnonymize).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onAnonymize).not.toHaveBeenCalled()
    expect(screen.queryByText('¿Anonimizar los datos de esta clienta?')).not.toBeInTheDocument()
  })

  it('al confirmar anonimiza la clienta y muestra el mensaje de éxito', async () => {
    const user = userEvent.setup()
    const { onAnonymize } = setup()

    await user.click(screen.getByRole('button', { name: 'Anonimizar datos' }))
    await user.click(screen.getByRole('button', { name: 'Sí, anonimizar' }))

    await waitFor(() => expect(onAnonymize).toHaveBeenCalledWith(client))
    expect(await screen.findByText('Los datos personales de la clienta se anonimizaron')).toBeInTheDocument()
  })

  it('si el servidor falla muestra el error y no el mensaje de éxito', async () => {
    const user = userEvent.setup()
    const onAnonymize = vi.fn().mockRejectedValue({ response: { status: 404, data: { error: 'Cliente no encontrado' } } })
    setup({ onAnonymize })

    await user.click(screen.getByRole('button', { name: 'Anonimizar datos' }))
    await user.click(screen.getByRole('button', { name: 'Sí, anonimizar' }))

    expect(await screen.findByText('Cliente no encontrado')).toBeInTheDocument()
    expect(screen.queryByText('Los datos personales de la clienta se anonimizaron')).not.toBeInTheDocument()
  })

  it('no ofrece anonimizar a una clienta que ya está anonimizada', () => {
    setup({ client: { ...client, name: 'Cliente eliminado', email: 'anonimo_c1@borrado.com' } })
    expect(screen.queryByRole('button', { name: 'Anonimizar datos' })).not.toBeInTheDocument()
  })
})
