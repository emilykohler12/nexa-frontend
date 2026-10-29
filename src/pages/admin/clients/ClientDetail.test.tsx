import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientDetail } from './ClientDetail'
import { ToastProvider } from '@/shared/ui/molecules/ToastProvider'
import type { AdminClient } from './types'

vi.mock('./tabs/InfoTab',    () => ({ InfoTab:    () => <div>formulario-info</div> }))
vi.mock('./tabs/HistoryTab', () => ({ HistoryTab: () => null }))
vi.mock('./tabs/LoyaltyTab', () => ({ LoyaltyTab: () => null }))
vi.mock('./tabs/GalleryTab', () => ({ GalleryTab: () => null }))
vi.mock('./tabs/ReviewsTab', () => ({ ReviewsTab: () => null }))

const client: AdminClient = {
  id: 'c1', name: 'Ana Pérez', photo: null, phone: '3764000000', email: 'ana@test.local',
  birthDate: null, gender: null,
  clinical: { allergies: '', preferences: '', observations: '' },
  loyalty: { totalVisits: 0, totalSpent: 0, lastVisit: null, points: 0, availablePromos: [] },
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

// Igual que setup, pero devuelve una función para pasarle al componente la clienta ya anonimizada
// (lo que hace ClientsPage cuando llega la respuesta del servidor).
function setupRerender() {
  const ui = (c: AdminClient) => (
    <ToastProvider>
      <ClientDetail
        client={c}
        onBack={vi.fn()}
        onSave={vi.fn()}
        onToggleBlock={vi.fn()}
        onAnonymize={vi.fn().mockResolvedValue(undefined)}
      />
    </ToastProvider>
  )
  const { rerender } = render(ui(client))
  return { rerenderWith: (c: AdminClient) => rerender(ui(c)) }
}

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

  it('una clienta anonimizada no muestra el formulario con los datos viejos ni se puede bloquear', () => {
    setup({ client: { ...client, name: 'Cliente eliminado', email: 'anonimo_c1@borrado.com' } })
    expect(screen.queryByText('formulario-info')).not.toBeInTheDocument()
    expect(screen.getByText(/ya no se pueden editar/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Bloquear cliente/ })).not.toBeInTheDocument()
  })

  it('al anonimizar, el formulario de información desaparece sin recargar la página', async () => {
    const user = userEvent.setup()
    const { rerenderWith } = setupRerender()
    expect(screen.getByText('formulario-info')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Anonimizar datos' }))
    await user.click(screen.getByRole('button', { name: 'Sí, anonimizar' }))
    rerenderWith({ ...client, name: 'Cliente eliminado', email: 'anonimo_c1@borrado.com' })

    expect(screen.queryByText('formulario-info')).not.toBeInTheDocument()
    expect(screen.getByText(/ya no se pueden editar/)).toBeInTheDocument()
  })

  it('una clienta que no está anonimizada conserva el formulario y el botón de bloquear', () => {
    setup()
    expect(screen.getByText('formulario-info')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bloquear cliente/ })).toBeInTheDocument()
  })
})
