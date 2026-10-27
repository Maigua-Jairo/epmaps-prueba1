import type { Medidor } from '@/domain/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** Con señal débil una petición puede quedarse colgada; se corta a los 10 s. */
const TIMEOUT_MS = 10_000;

/** No hubo respuesta del servidor: sin señal, tiempo agotado o red caída. */
export class SinConexionError extends Error {
  constructor() {
    super('Sin conexión con el sistema de la oficina');
    this.name = 'SinConexionError';
  }
}

async function pedir(ruta: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${ruta}`, { signal: controller.signal });
  } catch {
    throw new SinConexionError();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Busca un medidor por su código exacto. Devuelve null si no existe.
 * MockAPI filtra por coincidencia parcial y responde 404 cuando no hay resultados.
 */
export async function fetchMedidor(codigo: string): Promise<Medidor | null> {
  const res = await pedir(`/medidores?codigo=${encodeURIComponent(codigo)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
  const medidores = (await res.json()) as Medidor[];
  return medidores.find((m) => m.codigo === codigo) ?? null;
}
