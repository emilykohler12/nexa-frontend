import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteModal } from './InviteModal'
import { api } from '@/shared/utils/api'

vi.mock('@/shared/utils/api', () => ({ api: { post: vi.fn() } }))
vi.mock('@/features/tenant/TenantContext', () => ({ useTenant: () => ({ business: { primaryColor: '#069494' } }) }))

describe('InviteModal: el link vence siempre a los 7 días', () => {
  it('no ofrece elegir un vencimiento y no lo manda al servidor', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { token: 'abc', expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString() } } as never)
    render(<InviteModal onClose={vi.fn()} />)

    expect(screen.queryByText('Vencimiento del link')).not.toBeInTheDocument()
    expect(screen.getByText('El link vence a los 7 días de generarlo.')).toBeInTheDocument()

    await userEvent.type(screen.getByPlaceholderText('profesional@email.com'), 'nueva@test.local')
    await userEvent.click(screen.getByRole('button', { name: 'Generar link' }))

    expect(api.post).toHaveBeenCalledWith('/api/invitations', { email: 'nueva@test.local' })
  })
})
