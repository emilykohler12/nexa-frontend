import { describe, it, expect } from 'vitest'

// RF-35 (06/11/2026): el recordatorio de turno se manda aunque el correo no esté verificado. Ningún texto de la
// interfaz puede decir que hace falta verificar el correo para recibirlo (ni para reservar).
const sources = import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

describe('ningún texto pide verificar el correo', () => {
  it('no hay frases del tipo «necesitás / hace falta / tenés que verificar tu correo»', () => {
    const pattern = /(hace falta|necesit\w+|tenés que|tienes que|debés|es necesario|requiere)\s+(\w+\s+){0,3}verific\w+\s+(tu\s+|el\s+)?(correo|email|e-mail|mail)/i
    const offenders = Object.entries(sources)
      .filter(([path]) => !/\.test\.(ts|tsx)$/.test(path))
      .filter(([, text]) => pattern.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })

  it('el escaneo ve los archivos (no pasa en vacío)', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(100)
  })
})
