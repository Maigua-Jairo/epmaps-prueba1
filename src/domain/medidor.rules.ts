/** Etiqueta del medidor: "MED-" seguido de exactamente seis dígitos (R2). */
export const CODIGO_MEDIDOR_REGEX = /^MED-\d{6}$/;

export const LONGITUD_CODIGO_MEDIDOR = 10;

export function esCodigoMedidorValido(codigo: string): boolean {
  return CODIGO_MEDIDOR_REGEX.test(codigo);
}

/** Un dato en caché vale para toda la jornada: se reutiliza si se descargó hoy (R3). */
export function esDeLaJornada(fechaIso: string, ahora = new Date()): boolean {
  return new Date(fechaIso).toDateString() === ahora.toDateString();
}
