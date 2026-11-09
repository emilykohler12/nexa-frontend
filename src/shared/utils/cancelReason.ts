// Texto claro, en español, del motivo por el que un turno está cancelado o no asistido (historial de la clienta
// en el panel del administrador, RF-26). `cancelReason` y `cancelledBy` vienen del backend.
//  - cancelReason: 'user_cancelled' (cancelación hecha por la clienta o por el personal) o 'unpaid_expired' (se
//    liberó solo por falta de pago). Si el valor es otro (por ejemplo un texto cargado a mano) se muestra tal cual.
//  - cancelledBy: 'client', 'studio' o 'system'.
export function cancelReasonText(
  status: string,
  cancelReason?: string | null,
  cancelledBy?: string | null,
): string {
  if (status === 'cancelled_no_show') return 'La clienta no se presentó al turno'
  if (status === 'no_show_auto') return 'La clienta no se presentó: el sistema lo marcó solo a los 30 minutos'
  if (status !== 'cancelled') return ''

  if (cancelReason === 'unpaid_expired') return 'No se pagó la seña a tiempo: el turno se liberó solo'
  if (cancelReason === 'user_cancelled' || !cancelReason) {
    if (cancelledBy === 'client') return 'Cancelado por la clienta'
    if (cancelledBy === 'studio') return 'Cancelado por el estudio'
    if (cancelledBy === 'system') return 'Cancelado automáticamente por el sistema'
    return cancelReason ? 'Cancelado a pedido de la clienta o del estudio' : 'Sin motivo registrado'
  }
  // Un texto escrito a mano se muestra tal cual; un código desconocido (sin espacios) no se muestra crudo.
  return /\s/.test(cancelReason) ? cancelReason : 'Cancelado (motivo no especificado)'
}
