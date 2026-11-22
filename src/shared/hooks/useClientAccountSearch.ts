// Buscador de cuentas de clientas para el turno manual: se llama con lo que se escribe en «Nombre» y, pasado un instante,
// trae las cuentas que coinciden. Ignora las respuestas viejas (si se siguió escribiendo) y no rompe si falla la búsqueda.
import { useEffect, useRef, useState } from 'react'
import type { ClientMatch } from '@/shared/ui/molecules/ClientAccountMatches'

const MIN_CHARS = 2
const DEBOUNCE_MS = 250

export function useClientAccountSearch(search: (query: string) => Promise<ClientMatch[]>) {
  const [matches, setMatches]   = useState<ClientMatch[]>([])
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<ClientMatch | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const turn  = useRef(0)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const reset = () => { setMatches([]); setSearched(false) }

  // Para llamar en cada cambio del campo «Nombre».
  const lookup = (text: string) => {
    if (timer.current) clearTimeout(timer.current)
    const query = text.trim()
    turn.current += 1
    if (query.length < MIN_CHARS) { reset(); return }
    const mine = turn.current
    timer.current = setTimeout(async () => {
      try {
        const found = await search(query)
        if (mine === turn.current) { setMatches(found); setSearched(true) }
      } catch {
        if (mine === turn.current) reset()
      }
    }, DEBOUNCE_MS)
  }

  const select = (client: ClientMatch) => {
    if (timer.current) clearTimeout(timer.current)
    turn.current += 1
    setSelected(client)
    reset()
  }

  const clear = () => { setSelected(null); reset() }

  return { matches, searched, selected, lookup, select, clear }
}
