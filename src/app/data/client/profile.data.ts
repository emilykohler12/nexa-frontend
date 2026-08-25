export interface ClientProfile {
  name: string
  email: string
  phone: string
  photo: string | null
}

// Ejemplo — reemplazar por fetch real al backend
export const mockProfile: ClientProfile = {
  name: "María García",
  email: "maria@gmail.com",
  phone: "+54 376 401-2345",
  photo: null,
};