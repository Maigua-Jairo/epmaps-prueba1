export interface Tecnico {
  codigo: string;
  nombre: string;
}

/** Lo que se persiste del técnico identificado (R1). Nunca incluye la clave. */
export interface Sesion {
  tecnico: Tecnico;
  iniciadaEn: string;
}
