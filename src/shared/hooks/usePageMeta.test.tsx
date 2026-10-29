import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { usePageMeta } from './usePageMeta'
import { SITE_NAME, SITE_URL } from '@/app/config/seo.config'

function Page(props: Parameters<typeof usePageMeta>[0]) {
  usePageMeta(props)
  return null
}

const meta = (name: string) => document.head.querySelector(`meta[name="${name}"]`)
const canonical = () => document.head.querySelector('link[rel="canonical"]')

// Mismas etiquetas que trae index.html para la home.
beforeEach(() => {
  document.head.innerHTML = `
    <title>${SITE_NAME}</title>
    <meta name="description" content="descripción base" />
    <link rel="canonical" href="${SITE_URL}/" />`
})

describe('usePageMeta', () => {
  it('cambia título, descripción y canonical, y los restaura al salir', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/politica-privacidad']}>
        <Page title="Política de Privacidad" description="Cómo cuidamos tus datos" />
      </MemoryRouter>,
    )
    expect(document.title).toBe(`Política de Privacidad | ${SITE_NAME}`)
    expect(meta('description')?.getAttribute('content')).toBe('Cómo cuidamos tus datos')
    expect(canonical()?.getAttribute('href')).toBe(`${SITE_URL}/politica-privacidad`)

    unmount()
    expect(document.title).toBe(SITE_NAME)
    expect(meta('description')?.getAttribute('content')).toBe('descripción base')
    expect(canonical()?.getAttribute('href')).toBe(`${SITE_URL}/`)
  })

  it('no duplica etiquetas que ya existían', () => {
    render(<MemoryRouter><Page title={SITE_NAME} /></MemoryRouter>)
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  })

  it('con noindex pone robots y saca el canonical, y lo deshace al salir', () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Page title="Ingresar" noindex />
      </MemoryRouter>,
    )
    expect(meta('robots')?.getAttribute('content')).toBe('noindex, nofollow')
    expect(canonical()).toBeNull()

    unmount()
    expect(meta('robots')).toBeNull()
    expect(canonical()?.getAttribute('href')).toBe(`${SITE_URL}/`)
  })
})
