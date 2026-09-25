// src/shared/utils/uploadImage.ts
//
// Sube una imagen a Supabase Storage vía el backend (nunca directo desde el
// navegador — así el upload queda protegido por el mismo login de Nexa, sin
// exponer ninguna key de Supabase al cliente). Devuelve la URL pública ya
// lista para guardar en el campo que corresponda (logo, foto, imagen de
// producto, etc.) en vez del base64 gigante que se usaba antes.
import { api } from './api'

export async function uploadImage(file: File, folder = 'general'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const res = await api.post<{ url: string }>('/api/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.url
}
