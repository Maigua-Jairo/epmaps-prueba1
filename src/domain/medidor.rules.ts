import type { Medidor } from './types';

/** Etiqueta del medidor: "MED-" seguido de exactamente seis dígitos (R2). */
export const CODIGO_MEDIDOR_REGEX = /^MED-\d{6}$/;

export const LONGITUD_CODIGO_MEDIDOR = 10;

/** Un consumo mayor a este múltiplo del promedio mensual es anómalo (R6). */
export const FACTOR_ANOMALIA = 3;

export function esCodigoMedidorValido(codigo: string): boolean {
  return CODIGO_MEDIDOR_REGEX.test(codigo);
}

/** Un dato en caché vale para toda la jornada: se reutiliza si se descargó hoy (R3). */
export function esDeLaJornada(fechaIso: string, ahora = new Date()): boolean {
  return new Date(fechaIso).toDateString() === ahora.toDateString();
}

/** Consumo del mes: lectura actual menos la anterior (R6). */
export function calcularConsumo(medidor: Medidor, lectura: number): number {
  return lectura - medidor.ultimaLectura;
}

/** Anómalo si el consumo supera el triple del promedio mensual (R6). */
export function esConsumoAnomalo(medidor: Medidor, consumo: number): boolean {
  return consumo > medidor.consumoPromedio * FACTOR_ANOMALIA;
}

/** Mes de una fecha en formato AAAA-MM, en hora local. */
export function periodoDe(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
}

export function claveLectura(codigoMedidor: string, periodo: string): string {
  return `${codigoMedidor}_${periodo}`;
}
