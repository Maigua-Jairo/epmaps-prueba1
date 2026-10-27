import type { Lectura, Medidor } from '@/domain/types';

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

async function pedir(ruta: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${ruta}`, { ...init, signal: controller.signal });
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

interface LecturaRemota {
  id: string;
  clave: string;
}

/** Lectura ya registrada en la oficina con esa clave (medidor + mes), o null. */
export async function buscarLecturaRemota(clave: string): Promise<LecturaRemota | null> {
  const res = await pedir(`/Lecturas?clave=${encodeURIComponent(clave)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
  const lecturas = (await res.json()) as LecturaRemota[];
  return lecturas.find((l) => l.clave === clave) ?? null;
}

function cuerpoLectura(l: Lectura): string {
  return JSON.stringify({
    clave: l.clave,
    codigoMedidor: l.codigoMedidor,
    periodo: l.periodo,
    estadoMedidor: l.estadoMedidor,
    lectura: l.lectura,
    lecturaAnterior: l.lecturaAnterior,
    consumo: l.consumo,
    esAnomalo: l.esAnomalo,
    revisionConfirmada: l.revisionConfirmada,
    observacion: l.observacion,
    fotoUri: l.fotoUri,
    empleadoCodigo: l.tecnicoCodigo,
    registradaEn: l.registradaEn,
    verificacion: l.verificacion,
  });
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Crea la lectura en la oficina y devuelve el id que le asignó. */
export async function crearLecturaRemota(l: Lectura): Promise<string> {
  const res = await pedir('/Lecturas', { method: 'POST', headers: JSON_HEADERS, body: cuerpoLectura(l) });
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
  const creada = (await res.json()) as LecturaRemota;
  return creada.id;
}

/** Sobrescribe una lectura que ya existe en la oficina con los datos actuales. */
export async function actualizarLecturaRemota(idRemoto: string, l: Lectura): Promise<void> {
  const res = await pedir(`/Lecturas/${idRemoto}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: cuerpoLectura(l),
  });
  if (!res.ok) throw new Error(`El sistema de la oficina respondió con error ${res.status}`);
}
