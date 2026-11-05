// RF-02: celular argentino. Misma regla que el backend (nexa-backend/src/app/validators/phone.ts): se acepta con o
// sin +54, con o sin el 9, con o sin el 0 del código de área y con o sin el 15, y con espacios, guiones o paréntesis.
// El backend es la validación que vale; esta evita el viaje y muestra el error en el formulario.
const MOBILE_SHAPE = /^(?:\+?54)?9?0?[1-3]\d{1,3}(?:15)?\d{6,8}$/

export const PHONE_ERROR = 'Ingresá un celular argentino válido, por ejemplo 11 2345-6789'

export function isArgentineMobile(value: string): boolean {
  const cleaned = value.trim().replace(/[\s().-]/g, '')
  if (!MOBILE_SHAPE.test(cleaned)) return false
  // Sin prefijo del país, 9 ni 0 tienen que quedar código de área + número = 10 dígitos
  // (o 12 si trae el 15 pegado al código de área).
  const national = cleaned.replace(/^\+?54/, '').replace(/^9/, '').replace(/^0/, '')
  if (national.length === 10) return true
  return national.length === 12 && [2, 3, 4].some(area => national.slice(area, area + 2) === '15')
}

// Para formularios donde el teléfono es opcional: vacío vale, cualquier otra cosa tiene que ser un celular.
export function phoneError(value: string): string | null {
  const v = value.trim()
  return v === '' || isArgentineMobile(v) ? null : PHONE_ERROR
}
