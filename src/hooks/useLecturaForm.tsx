import { zodResolver } from '@hookform/resolvers/zod';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, use, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useForm, type DefaultValues, type UseFormReturn } from 'react-hook-form';
import { AppState } from 'react-native';

import {
  eliminarBorrador,
  guardarBorrador,
  type Borrador,
  type PasoRegistro,
} from '@/database/repositories/borradorRepository';
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

/** Espera tras la última tecla antes de escribir el borrador en SQLite. */
const DEBOUNCE_BORRADOR_MS = 300;

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
  /** Cada pantalla avisa cuál es al mostrarse, para reabrir el borrador en ese paso (R8). */
  marcarPaso: (paso: PasoRegistro) => void;
  /** Paso al que hay que avanzar al reanudar un borrador; se entrega una sola vez. */
  tomarPasoAReanudar: () => PasoRegistro | null;
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
 * Vive en el layout del flujo, así los datos se conservan al avanzar o retroceder,
 * y se copia a SQLite en cada cambio para sobrevivir al cierre de la app (R8).
 */
export function RegistroProvider({
  codigo,
  medidor,
  original,
  borrador,
  children,
}: {
  codigo: string;
  medidor: MedidorEnCache | null;
  original: Lectura | null;
  /** Borrador que se reanuda; sus datos tienen prioridad sobre los de la lectura original. */
  borrador: Borrador | null;
  children: ReactNode;
}) {
  const db = useSQLiteContext();
  const { sesion } = useSession();
  const form = useForm<LecturaFormValues>({
    resolver: zodResolver(crearLecturaSchema(medidor)),
    defaultValues: {
      ...(original ? valoresDe(original) : VALORES_INICIALES),
      ...borrador?.datos,
    },
    mode: 'onTouched',
  });

  const calculo = calcular(medidor, form.watch());

  // --- Borrador (R8) ---
  const pasoActual = useRef<PasoRegistro>(borrador?.paso ?? 'estado');
  const pasoAReanudar = useRef<PasoRegistro | null>(borrador?.paso ?? null);
  // Solo hay borrador cuando el técnico cambió algo (o al reanudar uno existente).
  const hayCambios = useRef(borrador !== null);
  const terminado = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const persistir = () => {
    clearTimeout(timer.current);
    if (!hayCambios.current || terminado.current || !sesion) return;
    guardarBorrador(db, {
      codigoMedidor: codigo,
      lecturaId: original?.id ?? null,
      tecnicoCodigo: sesion.tecnico.codigo,
      paso: pasoActual.current,
      datos: form.getValues(),
    });
  };
  // persistir solo lee refs y valores fijos durante el flujo (db, código, sesión).
  useEffect(() => {
    const cambios = form.watch(() => {
      hayCambios.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(persistir, DEBOUNCE_BORRADOR_MS);
    });
    // Al pasar a segundo plano (primer paso al quitar la app de recientes) se guarda ya.
    const app = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') persistir();
    });
    return () => {
      cambios.unsubscribe();
      app.remove();
      clearTimeout(timer.current);
    };
  }, [form]);

  // Estables (sin dependencias): las pantallas los usan en useFocusEffect.
  // persistir solo lee refs y valores fijos durante el flujo.
  const marcarPaso = useCallback((paso: PasoRegistro) => {
    pasoActual.current = paso;
    persistir();
  }, []);

  const tomarPasoAReanudar = useCallback(() => {
    const paso = pasoAReanudar.current;
    pasoAReanudar.current = null;
    return paso;
  }, []);

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

    let id: number;
    if (original) {
      await corregirLectura(db, original.id, datos);
      id = original.id;
    } else {
      const ahora = new Date();
      const periodo = periodoDe(ahora);
      id = await insertarLectura(db, {
        ...datos,
        registroId: nuevoRegistroId(),
        clave: claveLectura(codigo, periodo),
        codigoMedidor: codigo,
        periodo,
        tecnicoCodigo: sesion!.tecnico.codigo,
        registradaEn: ahora.toISOString(),
      });
    }

    // La lectura ya está guardada. La limpieza que sigue no debe hacer fallar el registro.
    terminado.current = true;
    clearTimeout(timer.current);
    try {
      await eliminarBorrador(db);
      // La foto anterior de una corrección se conserva hasta confirmarla; recién ahora se borra.
      if (original && original.fotoUri !== v.fotoUri) eliminarFoto(original.fotoUri);
    } catch (e) {
      console.warn('Limpieza tras guardar la lectura', e);
    }
    return id;
  };

  return (
    <RegistroContext
      value={{
        codigo,
        medidor,
        original,
        form,
        calculo,
        marcarPaso,
        tomarPasoAReanudar,
        guardar,
      }}>
      {children}
    </RegistroContext>
  );
}

export function useRegistro(): RegistroContextValue {
  const ctx = use(RegistroContext);
  if (!ctx) throw new Error('useRegistro debe usarse dentro de <RegistroProvider>');
  return ctx;
}
