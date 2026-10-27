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

export type EstadoEnvio = 'PENDIENTE' | 'ENVIADA';

export interface Lectura {
  id: number;
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
  registradaEn: string;
}

export type NuevaLectura = Omit<Lectura, 'id' | 'estadoEnvio'>;
