import type { Tecnico } from './types';

interface Credencial extends Tecnico {
  clave: string;
}

/** Técnicos de prueba con datos quemados; R1 no exige gestión de usuarios. */
const TECNICOS: Credencial[] = [
  { codigo: 'EMP-001', nombre: 'Carlos Andrade', clave: 'epmaps2026' },
  { codigo: 'EMP-002', nombre: 'María Guamán', clave: 'epmaps2026' },
  { codigo: 'EMP-003', nombre: 'Luis Tipán', clave: 'epmaps2026' },
];

export function autenticar(codigo: string, clave: string): Tecnico | null {
  const encontrado = TECNICOS.find(
    (t) => t.codigo === codigo.trim().toUpperCase() && t.clave === clave,
  );
  return encontrado ? { codigo: encontrado.codigo, nombre: encontrado.nombre } : null;
}
