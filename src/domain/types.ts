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
