// src/shared/utils/pendingCheckout.ts
//
// Cuando un cliente no logueado intenta confirmar su carrito, lo mandamos a
// iniciar sesión / registrarse y dejamos esta marca — así, apenas entra,
// lo devolvemos directo al carrito en vez de a su panel de siempre.
export const PENDING_CART_CHECKOUT_KEY = 'nexa_pending_cart_checkout'

export function consumePendingCartCheckout(): boolean {
  try {
    const pending = sessionStorage.getItem(PENDING_CART_CHECKOUT_KEY) === '1'
    if (pending) sessionStorage.removeItem(PENDING_CART_CHECKOUT_KEY)
    return pending
  } catch {
    return false
  }
}
