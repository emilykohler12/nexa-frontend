// Traducciones de estados de la aplicación para notificaciones y activity logs
export const statusLabels: Record<string, string> = {
  // Turnos
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
  no_show: 'No asistió',

  // Pedidos - estado de entrega
  ready: 'Listo',
  delivered: 'Entregado',

  // Pagos
  paid: 'Pagado',
  approved: 'Aprobado',

  // Estados de Mercado Pago
  pending_payment: 'Pago pendiente',
};

export function translateStatus(status: string): string {
  return statusLabels[status] ?? status;
}
