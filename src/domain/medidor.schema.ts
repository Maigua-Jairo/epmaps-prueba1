import { z } from 'zod';

import { calcularConsumo, esConsumoAnomalo, fotoEsObligatoria } from './medidor.rules';
import type { Medidor } from './types';

export const ESTADOS_MEDIDOR = ['NORMAL', 'INACCESIBLE', 'DANADO'] as const;

const MIN_TEXTO = 5;

/**
 * Formulario de lectura. La matriz de estados (R5) y la regla de anomalía (R6)
 * dependen de los datos del medidor, por eso el esquema se construye con él.
 * Sin medidor (registrado sin señal y sin caché) solo se validan las reglas de R5.
 */
export function crearLecturaSchema(medidor: Medidor | null) {
  return z
    .object({
      estado: z.enum(ESTADOS_MEDIDOR, { error: 'Selecciona el estado del medidor' }),
      lectura: z.string().trim(),
      motivo: z.string().trim(),
      descripcion: z.string().trim(),
      revisionConfirmada: z.boolean(),
      /** Ruta de la foto ya copiada al almacenamiento persistente del teléfono. */
      fotoUri: z.string().nullable(),
    })
    .superRefine((d, ctx) => {
      const tieneLectura = d.lectura !== '';
      const lecturaValida = /^\d+$/.test(d.lectura);
      if (tieneLectura && !lecturaValida) {
        ctx.addIssue({ code: 'custom', path: ['lectura'], message: 'Ingresa solo números enteros' });
        return;
      }

      // R5: matriz de estados.
      if (d.estado === 'NORMAL' && !tieneLectura) {
        ctx.addIssue({
          code: 'custom',
          path: ['lectura'],
          message: 'La lectura es obligatoria si el medidor está normal',
        });
      }
      if (d.estado === 'INACCESIBLE') {
        if (d.motivo.length < MIN_TEXTO) {
          ctx.addIssue({
            code: 'custom',
            path: ['motivo'],
            message: `Indica el motivo (mínimo ${MIN_TEXTO} caracteres)`,
          });
        }
        if (tieneLectura) {
          ctx.addIssue({
            code: 'custom',
            path: ['lectura'],
            message: 'Un medidor inaccesible no registra lectura',
          });
        }
      }
      if (d.estado === 'DANADO' && d.descripcion.length < MIN_TEXTO) {
        ctx.addIssue({
          code: 'custom',
          path: ['descripcion'],
          message: `Describe el daño (mínimo ${MIN_TEXTO} caracteres)`,
        });
      }

      // R6: comparación con la lectura anterior.
      let esAnomalo = false;
      if (medidor && tieneLectura && d.estado !== 'INACCESIBLE') {
        const consumo = calcularConsumo(medidor, Number(d.lectura));
        esAnomalo = consumo >= 0 && esConsumoAnomalo(medidor, consumo);
        if (consumo < 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['lectura'],
            message: `No puede ser menor que la lectura anterior (${medidor.ultimaLectura} m³)`,
          });
        } else if (esAnomalo && !d.revisionConfirmada) {
          ctx.addIssue({
            code: 'custom',
            path: ['revisionConfirmada'],
            message: 'Confirma que revisaste el medidor para continuar',
          });
        }
      }

      // R7: foto obligatoria con consumo anómalo o medidor dañado.
      if (fotoEsObligatoria(d.estado, esAnomalo) && !d.fotoUri) {
        ctx.addIssue({
          code: 'custom',
          path: ['fotoUri'],
          message:
            d.estado === 'DANADO'
              ? 'La foto es obligatoria cuando el medidor está dañado'
              : 'La foto es obligatoria cuando el consumo es anómalo',
        });
      }
    });
}

export type LecturaFormValues = z.input<ReturnType<typeof crearLecturaSchema>>;
