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

export interface MedidorEnCache extends Medidor {
  consultadoEn: string;
}

export type EstadoMedidor = 'NORMAL' | 'INACCESIBLE' | 'DANADO';

/** R4: VERIFICADA al registrar, PENDIENTE_VERIFICAR sin señal, REQUIERE_REVISION si resultó anómala. */
export type Verificacion = 'VERIFICADA' | 'PENDIENTE_VERIFICAR' | 'REQUIERE_REVISION';

/** R10: solo PENDIENTE se puede corregir; RECHAZADA: la oficina ya tenía la lectura del mes. */
export type EstadoEnvio = 'PENDIENTE' | 'ENVIADA' | 'RECHAZADA';

export interface Lectura {
  id: number;
  /** Identifica este registro concreto; distingue un reintento propio de un duplicado ajeno. */
  registroId: string;
  /** codigo_periodo: identifica la lectura de un medidor en un mes (R9, R10). */
  clave: string;
  codigoMedidor: string;
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
