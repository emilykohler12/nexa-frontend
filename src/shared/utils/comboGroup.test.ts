import { describe, it, expect } from 'vitest'
import { groupByCombo } from './comboGroup'

describe('groupByCombo', () => {
  it('agrupa turnos con el mismo comboGroupId manteniendo el orden de aparición', () => {
    const items = [
      { id: 'a', comboGroupId: 'g1' },
      { id: 'b', comboGroupId: null },
      { id: 'c', comboGroupId: 'g1' },
      { id: 'd', comboGroupId: 'g2' },
    ]
    const groups = groupByCombo(items)

    expect(groups).toHaveLength(3)
    expect(groups[0]).toEqual({ comboGroupId: 'g1', items: [items[0], items[2]] })
    expect(groups[1]).toEqual({ comboGroupId: null, items: [items[1]] })
    expect(groups[2]).toEqual({ comboGroupId: 'g2', items: [items[3]] })
  })

  it('cada turno suelto (sin comboGroupId) queda en su propio grupo, nunca mezclados', () => {
    const items = [{ comboGroupId: null }, { comboGroupId: null }]
    const groups = groupByCombo(items)
    expect(groups).toHaveLength(2)
  })

  it('lista vacía da lista de grupos vacía', () => {
    expect(groupByCombo([])).toEqual([])
  })
})
