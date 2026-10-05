// RF-12 — vínculo de quien acompaña, lista cerrada (igual que COMPANION_RELATIONS
// del backend). No hay campo de nombre: de una menor de 13 años solo queda
// registrado que viene acompañada y por quién (vínculo), nunca su identidad.
export const COMPANION_RELATIONS = ['child', 'partner', 'family', 'friend', 'other'] as const
export type CompanionRelation = typeof COMPANION_RELATIONS[number]

export const COMPANION_RELATION_LABELS: Record<CompanionRelation, string> = {
  child:   'Hija/hijo',
  partner: 'Pareja',
  family:  'Familiar',
  friend:  'Amiga/o',
  other:   'Otra',
}

export function companionText(details: { hasCompanion: boolean; companionRelation: CompanionRelation | null }): string | null {
  if (!details.hasCompanion) return null
  return details.companionRelation
    ? `Viene acompañado/a (${COMPANION_RELATION_LABELS[details.companionRelation].toLowerCase()})`
    : 'Viene acompañado/a'
}
