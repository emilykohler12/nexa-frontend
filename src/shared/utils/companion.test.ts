import { describe, it, expect } from 'vitest'
import { companionText, COMPANION_RELATIONS } from './companion'

describe('companionText (RF-12)', () => {
  it('sin acompañante no muestra nada', () => {
    expect(companionText({ hasCompanion: false, companionRelation: null })).toBeNull()
  })

  it('muestra solo el vínculo, nunca un nombre', () => {
    expect(companionText({ hasCompanion: true, companionRelation: 'child' })).toBe('Viene acompañado/a (hija/hijo)')
    expect(companionText({ hasCompanion: true, companionRelation: null })).toBe('Viene acompañado/a')
  })

  it('la lista cerrada coincide con la del backend', () => {
    expect(COMPANION_RELATIONS).toEqual(['child', 'partner', 'family', 'friend', 'other'])
  })
})
