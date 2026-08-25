export interface FavoriteItem {
  id: string
  type: "professional" | "service"
  name: string
  detail: string
}

// Ejemplo — reemplazar por fetch real al backend
export const mockFavorites: FavoriteItem[] = [
  { id: "f1", type: "professional", name: "Lucía Martínez", detail: "Cabello" },
  { id: "f2", type: "service", name: "Manicura", detail: "30 min — $2.000" },
  { id: "f3", type: "professional", name: "Sofía López", detail: "Uñas" },
];