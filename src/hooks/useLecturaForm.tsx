import { zodResolver } from '@hookform/resolvers/zod';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, type ReactNode } from 'react';
import { useForm, type DefaultValues, type UseFormReturn } from 'react-hook-form';

import { insertarLectura } from '@/database/repositories/lecturaRepository';
import {
  calcularConsumo,
  claveLectura,
  esConsumoAnomalo,
  periodoDe,
} from '@/domain/medidor.rules';
import { crearLecturaSchema, type LecturaFormValues } from '@/domain/medidor.schema';
import type { MedidorEnCache, Verificacion } from '@/domain/types';
import { hayConexion } from '@/services/networkService';

import { useSession } from './useSession';

interface Calculo {
  lectura: number | null;
  /** Null si no hay lectura o si no se tienen datos del medidor (sin señal y sin caché). */
  consumo: number | null;
  esAnomalo: boolean;
}

interface RegistroContextValue {
  codigo: string;
  medidor: MedidorEnCache | null;
  form: UseFormReturn<LecturaFormValues>;
  calculo: Calculo;
  /** Guarda la lectura validada en SQLite y devuelve su id local. */
  guardar: () => Promise<number>;
}

const RegistroContext = createContext<RegistroContextValue | null>(null);

// El estado arranca sin elegir: el técnico debe seleccionarlo en el primer paso.
const VALORES_INICIALES: DefaultValues<LecturaFormValues> = {
  lectura: '',
  motivo: '',
  descripcion: '',
  revisionConfirmada: false,
};

function calcular(medidor: MedidorEnCache | null, v: LecturaFormValues): Calculo {
  const lectura = v.estado !== 'INACCESIBLE' && /^\d+$/.test(v.lectura) ? Number(v.lectura) : null;
  if (lectura === null || !medidor) return { lectura, consumo: null, esAnomalo: false };
  const consumo = calcularConsumo(medidor, lectura);
  return { lectura, consumo, esAnomalo: consumo >= 0 && esConsumoAnomalo(medidor, consumo) };
}

/**
 * Un solo formulario (react-hook-form + Zod) compartido por las pantallas del registro.
 * Vive en el layout del flujo, así los datos se conservan al avanzar o retroceder.
 */
export function RegistroProvider({
  codigo,
  medidor,
  children,
}: {
  codigo: string;
  medidor: MedidorEnCache | null;
  children: ReactNode;
}) {
  const db = useSQLiteContext();
  const { sesion } = useSession();
  const form = useForm<LecturaFormValues>({
    resolver: zodResolver(crearLecturaSchema(medidor)),
    defaultValues: VALORES_INICIALES,
    mode: 'onTouched',
  });

  const calculo = calcular(medidor, form.watch());

  const guardar = async () => {
    const v = form.getValues();
    const { lectura, consumo, esAnomalo } = calcular(medidor, v);
    const ahora = new Date();
    const periodo = periodoDe(ahora);

    // R4: sin señal o sin datos del medidor, la comparación queda para cuando haya conexión.
    const verificacion: Verificacion =
      medidor && (await hayConexion()) ? 'VERIFICADA' : 'PENDIENTE_VERIFICAR';

    return insertarLectura(db, {
      clave: claveLectura(codigo, periodo),
      codigoMedidor: codigo,
      periodo,
      tecnicoCodigo: sesion!.tecnico.codigo,
      estadoMedidor: v.estado,
      lectura,
      lecturaAnterior: medidor?.ultimaLectura ?? null,
      consumo,
      consumoPromedio: medidor?.consumoPromedio ?? null,
      esAnomalo,
      revisionConfirmada: esAnomalo && v.revisionConfirmada,
      observacion:
        v.estado === 'INACCESIBLE' ? v.motivo.trim() : v.estado === 'DANADO' ? v.descripcion.trim() : null,
      fotoUri: null,
      verificacion,
      registradaEn: ahora.toISOString(),
    });
  };

  return (
    <RegistroContext value={{ codigo, medidor, form, calculo, guardar }}>{children}</RegistroContext>
  );
}

export function useRegistro(): RegistroContextValue {
  const ctx = use(RegistroContext);
  if (!ctx) throw new Error('useRegistro debe usarse dentro de <RegistroProvider>');
  return ctx;
}
