import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const registerSchema = z.object({
  name:     z.string().min(2, 'Ingresá tu nombre completo'),
  phone:    z.string().optional().refine(v => !v || v.length >= 6, { message: 'Ingresá un teléfono válido' }),
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  gender:   z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  termsAccepted: z.boolean().refine(v => v === true, {
    message: 'Tenés que aceptar los Términos de Servicio y la Política de Privacidad',
  }),
})

export type LoginInput    = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>