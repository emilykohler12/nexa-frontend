// src/shared/hooks/usePageMeta.ts
//
// Pone título, descripción, canonical y robots de la página que se está viendo.
// index.html ya trae esas etiquetas para la home; este hook las cambia mientras
// la página está montada y las deja como estaban al salir. No se usan los
// <title>/<meta> nativos de React 19 porque agregan una segunda etiqueta al lado
// de la de index.html y quedarían duplicadas.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/app/config/seo.config'

interface PageMeta {
  title: string
  description?: string
  /** Página que no debe aparecer en Google (login, resultado de pago, etc.). */
  noindex?: boolean
}

type Tag = { selector: string; create: () => HTMLElement; attr: string }

const meta = (key: 'name' | 'property', value: string): Tag => ({
  selector: `meta[${key}="${value}"]`,
  create: () => {
    const el = document.createElement('meta')
    el.setAttribute(key, value)
    return el
  },
  attr: 'content',
})

const canonicalTag: Tag = {
  selector: 'link[rel="canonical"]',
  create: () => {
    const el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    return el
  },
  attr: 'href',
}

// Cambia una etiqueta (la crea si no existe) y devuelve cómo deshacerlo.
function applyTag(tag: Tag, value: string | null): () => void {
  const existing = document.head.querySelector<HTMLElement>(tag.selector)
  const previous = existing ? existing.getAttribute(tag.attr) : null

  if (value === null) {
    existing?.remove()
    return () => {
      if (existing) document.head.appendChild(existing)
    }
  }

  const el = existing ?? tag.create()
  el.setAttribute(tag.attr, value)
  if (!existing) document.head.appendChild(el)

  return () => {
    if (!existing) el.remove()
    else if (previous === null) el.removeAttribute(tag.attr)
    else el.setAttribute(tag.attr, previous)
  }
}

export function usePageMeta({ title, description = SITE_DESCRIPTION, noindex = false }: PageMeta) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
    const canonical = noindex ? null : `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`
    const previousTitle = document.title
    document.title = fullTitle

    const undo = [
      applyTag(meta('name', 'description'), description),
      applyTag(meta('name', 'robots'), noindex ? 'noindex, nofollow' : null),
      applyTag(canonicalTag, canonical),
      applyTag(meta('property', 'og:title'), fullTitle),
      applyTag(meta('property', 'og:description'), description),
      applyTag(meta('property', 'og:url'), canonical),
      applyTag(meta('name', 'twitter:title'), fullTitle),
      applyTag(meta('name', 'twitter:description'), description),
    ]

    return () => {
      document.title = previousTitle
      undo.reverse().forEach(fn => fn())
    }
  }, [title, description, noindex, pathname])
}
