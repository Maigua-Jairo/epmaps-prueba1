import { zodResolver } from '@hookform/resolvers/zod';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, type ReactNode } from 'react';
import { useForm, type DefaultValues, type UseFormReturn } from 'react-hook-form';

import { corregirLectura, insertarLectura } from '@/database/repositories/lecturaRepository';
import {
  calcularConsumo,
  claveLectura,
  esConsumoAnomalo,
  fotoEsObligatoria,
  nuevoRegistroId,
  periodoDe,
} from '@/domain/medidor.rules';
import { crearLecturaSchema, type LecturaFormValues } from '@/domain/medidor.schema';
import type { Lectura, MedidorEnCache, Verificacion } from '@/domain/types';
import { eliminarFoto } from '@/services/imageStorage';
import { hayConexion } from '@/services/networkService';

import { useSession } from './useSession';

interface Calculo {
  lectura: number | null;
  /** Null si no hay lectura o si no se tienen datos del medidor (sin señal y sin caché). */
  consumo: number | null;
  esAnomalo: boolean;
  fotoObligatoria: boolean;
}

interface RegistroContextValue {
  codigo: string;
  medidor: MedidorEnCache | null;
  /** Lectura que se está corrigiendo (R10); null en un registro nuevo. */
  original: Lectura | null;
  form: UseFormReturn<LecturaFormValues>;
  calculo: Calculo;
  /** Guarda (o corrige) la lectura validada en SQLite y devuelve su id local. */
  guardar: () => Promise<number>;
}

const RegistroContext = createContext<RegistroContextValue | null>(null);

// En un registro nuevo el estado arranca sin elegir: el técnico debe seleccionarlo.
const VALORES_INICIALES: DefaultValues<LecturaFormValues> = {
  lectura: '',
  motivo: '',
  descripcion: '',
  revisionConfirmada: false,
  fotoUri: null,
};

function valoresDe(l: Lectura): LecturaFormValues {
  return {
    estado: l.estadoMedidor,
    lectura: l.lectura !== null ? String(l.lectura) : '',
    motivo: l.estadoMedidor === 'INACCESIBLE' ? (l.observacion ?? '') : '',
    descripcion: l.estadoMedidor === 'DANADO' ? (l.observacion ?? '') : '',
    revisionConfirmada: l.revisionConfirmada,
    fotoUri: l.fotoUri,
  };
}

function calcular(medidor: MedidorEnCache | null, v: LecturaFormValues): Calculo {
  const lectura = v.estado !== 'INACCESIBLE' && /^\d+$/.test(v.lectura) ? Number(v.lectura) : null;
  const consumo = lectura !== null && medidor ? calcularConsumo(medidor, lectura) : null;
  const esAnomalo = consumo !== null && consumo >= 0 && esConsumoAnomalo(medidor!, consumo);
  return { lectura, consumo, esAnomalo, fotoObligatoria: fotoEsObligatoria(v.estado, esAnomalo) };
}

/**
 * Un solo formulario (react-hook-form + Zod) compartido por las pantallas del registro.
 * Vive en el layout del flujo, así los datos se conservan al avanzar o retroceder.
 */
export function RegistroProvider({
  codigo,
  medidor,
  original,
  children,
}: {
  codigo: string;
  medidor: MedidorEnCache | null;
  original: Lectura | null;
  children: ReactNode;
}) {
  const db = useSQLiteContext();
  const { sesion } = useSession();
  const form = useForm<LecturaFormValues>({
    resolver: zodResolver(crearLecturaSchema(medidor)),
    defaultValues: original ? valoresDe(original) : VALORES_INICIALES,
    mode: 'onTouched',
  });

  const calculo = calcular(medidor, form.watch());

  const guardar = async () => {
    const v = form.getValues();
    const { lectura, consumo, esAnomalo } = calcular(medidor, v);

    // R4: sin señal o sin datos del medidor, la comparación queda para cuando haya conexión.
    const verificacion: Verificacion =
      medidor && (await hayConexion()) ? 'VERIFICADA' : 'PENDIENTE_VERIFICAR';

    const datos = {
      estadoMedidor: v.estado,
      lectura,
      lecturaAnterior: medidor?.ultimaLectura ?? null,
      consumo,
      consumoPromedio: medidor?.consumoPromedio ?? null,
      esAnomalo,
      revisionConfirmada: esAnomalo && v.revisionConfirmada,
      observacion:
        v.estado === 'INACCESIBLE' ? v.motivo.trim() : v.estado === 'DANADO' ? v.descripcion.trim() : null,
      fotoUri: v.fotoUri,
      verificacion,
    };

    if (original) {
      await corregirLectura(db, original.id, datos);
      // La foto anterior se conserva hasta confirmar la corrección; recién ahí se borra.
      if (original.fotoUri !== v.fotoUri) eliminarFoto(original.fotoUri);
      return original.id;
    }

    const ahora = new Date();
    const periodo = periodoDe(ahora);
    return insertarLectura(db, {
      ...datos,
      registroId: nuevoRegistroId(),
      clave: claveLectura(codigo, periodo),
      codigoMedidor: codigo,
      periodo,
      tecnicoCodigo: sesion!.tecnico.codigo,
      registradaEn: ahora.toISOString(),
    });
  };

  return (
    <RegistroContext value={{ codigo, medidor, original, form, calculo, guardar }}>
      {children}
    </RegistroContext>
  );
}

export function useRegistro(): RegistroContextValue {
  const ctx = use(RegistroContext);
  if (!ctx) throw new Error('useRegistro debe usarse dentro de <RegistroProvider>');
  return ctx;
}
