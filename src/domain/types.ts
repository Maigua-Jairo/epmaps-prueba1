export interface Tecnico {
  codigo: string;
  nombre: string;
}

/** Lo que se persiste del técnico identificado (R1). Nunca incluye la clave. */
export interface Sesion {
  tecnico: Tecnico;
  iniciadaEn: string;
}

/** Los siete datos que envía el sistema de la oficina (R3), más el código. */
export interface Medidor {
  codigo: string;
  direccion: string;
  sector: string;
  numeroCuenta: string;
  estado: string;
  ultimaLectura: number;
  fechaUltimaLectura: string;
  consumoPromedio: number;
}

/** Medidor guardado en la caché local, con la hora en que se descargó. */
export interface MedidorEnCache extends Medidor {
  consultadoEn: string;
}

/** Estado físico del medidor al momento de la visita (R5). */
export type EstadoMedidor = 'NORMAL' | 'INACCESIBLE' | 'DANADO';

/**
 * Comparación con la lectura anterior (R4):
 * - VERIFICADA: se comparó con datos del sistema al registrar.
 * - PENDIENTE_VERIFICAR: se registró sin señal; se compara al recuperar conexión.
 * - REQUIERE_REVISION: al verificar resultó anómala sin la confirmación del técnico.
 */
export type Verificacion = 'VERIFICADA' | 'PENDIENTE_VERIFICAR' | 'REQUIERE_REVISION';

/**
 * - PENDIENTE: en el teléfono; se puede corregir (R10).
 * - ENVIADA: llegó a la oficina; ya no se puede corregir (R10).
 * - RECHAZADA: la oficina ya tenía otra lectura de ese medidor en ese mes (R10).
 */
export type EstadoEnvio = 'PENDIENTE' | 'ENVIADA' | 'RECHAZADA';

export interface Lectura {
  id: number;
  /** Identifica este registro concreto; distingue un reintento propio de un duplicado ajeno. */
  registroId: string;
  /** codigo_periodo: identifica la lectura de un medidor en un mes (R9, R10). */
  clave: string;
  codigoMedidor: string;
  /** Mes de la lectura en formato AAAA-MM. */
  periodo: string;
  tecnicoCodigo: string;
  estadoMedidor: EstadoMedidor;
  lectura: number | null;
  lecturaAnterior: number | null;
  consumo: number | null;
  consumoPromedio: number | null;
  esAnomalo: boolean;
  revisionConfirmada: boolean;
  /** Motivo (inaccesible) o descripción del daño (dañado). */
  observacion: string | null;
  fotoUri: string | null;
  verificacion: Verificacion;
  estadoEnvio: EstadoEnvio;
  motivoRechazo: string | null;
  /** Aumenta con cada corrección; evita marcar como enviada una versión ya corregida. */
  revision: number;
  registradaEn: string;
}

export type NuevaLectura = Omit<Lectura, 'id' | 'estadoEnvio' | 'motivoRechazo' | 'revision'>;

/** Campos que el técnico puede corregir mientras la lectura no se envíe (R10). */
export type CorreccionLectura = Pick<
  Lectura,
  | 'estadoMedidor'
  | 'lectura'
  | 'lecturaAnterior'
  | 'consumo'
  | 'consumoPromedio'
  | 'esAnomalo'
  | 'revisionConfirmada'
  | 'observacion'
  | 'fotoUri'
  | 'verificacion'
>;
