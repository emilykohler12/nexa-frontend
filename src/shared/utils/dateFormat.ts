// Las fechas viajan como texto «AAAA-MM-DD», pero todo lo que lee una persona va primero día, después mes y
// después año: «DD/MM/AAAA». No pasan por Date, así que la zona horaria del navegador no las corre un día.

// «2026-11-21» → «21/11/2026». Si el texto no tiene la forma de una fecha se devuelve como vino.
export function formatDateDMY(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : date
}

// Cambia toda fecha «AAAA-MM-DD» que aparezca dentro de un texto (detalle del registro de actividad, avisos, mensajes
// del servidor) por «DD/MM/AAAA». Sirve también para lo que se guardó antes de este cambio.
export function dmyInText(text: string): string {
  return text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3/$2/$1')
}
