// Agrupa turnos que comparten comboGroupId (servicios de un combo reservados
// en simultáneo) para que las vistas de calendario los muestren juntos en vez
// de como turnos sueltos sin relación.
export interface ComboGroup<T> {
  comboGroupId: string | null
  items: T[]
}

export function groupByCombo<T extends { comboGroupId?: string | null }>(items: T[]): ComboGroup<T>[] {
  const groups: ComboGroup<T>[] = []
  const indexByGroupId = new Map<string, number>()

  for (const item of items) {
    if (item.comboGroupId) {
      const existingIndex = indexByGroupId.get(item.comboGroupId)
      if (existingIndex !== undefined) {
        groups[existingIndex].items.push(item)
      } else {
        indexByGroupId.set(item.comboGroupId, groups.length)
        groups.push({ comboGroupId: item.comboGroupId, items: [item] })
      }
    } else {
      groups.push({ comboGroupId: null, items: [item] })
    }
  }

  return groups
}
