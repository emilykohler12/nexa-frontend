//src/pages/admin/services/schemas.ts

import { z } from 'zod';

export const serviceFormSchema = z.object({
  name: z.string().min(2, 'Ingresá un nombre'),
  categoryId: z.string().min(1, 'Elegí una categoría'),
  description: z.string().min(5, 'Agregá una descripción breve'),
  duration: z.coerce.number().min(5, 'Mínimo 5 minutos'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  image: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
  isCombo: z.coerce.boolean().default(false),
});

export type ServiceFormSchema = z.infer<typeof serviceFormSchema>;