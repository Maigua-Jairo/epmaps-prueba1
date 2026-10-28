import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { RegistroHeader } from '@/components/RegistroHeader';
import { Button } from '@/components/ui';
import type { EstadoMedidor } from '@/domain/types';
import { useRegistro } from '@/hooks/useLecturaForm';

const OPCIONES: { estado: EstadoMedidor; titulo: string; detalle: string; color: string }[] = [
  {
    estado: 'NORMAL',
    titulo: 'Normal',
    detalle: 'El medidor se puede leer. La lectura es obligatoria.',
    color: 'bg-emerald-500',
  },
  {
    estado: 'INACCESIBLE',
    titulo: 'Inaccesible',
    detalle: 'No se puede llegar al medidor. Indica el motivo; no se registra lectura.',
    color: 'bg-amber-500',
  },
  {
    estado: 'DANADO',
    titulo: 'Dañado',
    detalle: 'Describe el daño. La lectura es opcional.',
    color: 'bg-red-500',
  },
];

const SIGUIENTES_PASOS = [
  { paso: 'datos', ruta: '/lectura/[codigo]/datos' },
  { paso: 'foto', ruta: '/lectura/[codigo]/foto' },
  { paso: 'resumen', ruta: '/lectura/[codigo]/resumen' },
] as const;

/** Paso 1: estado del medidor (R5). */
export default function EstadoScreen() {
  const { codigo, form, marcarPaso, tomarPasoAReanudar } = useRegistro();

  useFocusEffect(useCallback(() => marcarPaso('estado'), [marcarPaso]));

  // R8: al continuar un borrador se apilan las pantallas hasta el paso donde quedó,
  // así "Volver" sigue recorriendo el flujo en orden.
  useEffect(() => {
    const destino = tomarPasoAReanudar();
    if (!destino || destino === 'estado') return;
    for (const { paso, ruta } of SIGUIENTES_PASOS) {
      router.push({ pathname: ruta, params: { codigo } });
      if (paso === destino) break;
    }
  }, [codigo, tomarPasoAReanudar]);

  const continuar = async () => {
    if (await form.trigger('estado')) {
      router.push({ pathname: '/lectura/[codigo]/datos', params: { codigo } });
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <RegistroHeader paso={1} titulo="Estado del medidor" />
      <ScrollView contentContainerClassName="gap-3 p-4 pb-10">
        <Controller
          control={form.control}
          name="estado"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View className="gap-3">
              {OPCIONES.map((op) => {
                const elegido = value === op.estado;
                return (
                  <Pressable
                    key={op.estado}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: elegido }}
                    onPress={() => {
                      onChange(op.estado);
                      // Un medidor inaccesible no registra lectura (R5).
                      if (op.estado === 'INACCESIBLE') form.setValue('lectura', '');
                    }}
                    className={`flex-row items-center gap-4 rounded-3xl border-2 bg-white p-5 ${
                      elegido ? 'border-epmaps-primary' : 'border-transparent'
                    }`}>
                    <View className={`h-4 w-4 rounded-full ${op.color}`} />
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900">{op.titulo}</Text>
                      <Text className="text-sm text-slate-500">{op.detalle}</Text>
                    </View>
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                        elegido ? 'border-epmaps-primary' : 'border-slate-300'
                      }`}>
                      {elegido ? <View className="h-3 w-3 rounded-full bg-epmaps-primary" /> : null}
                    </View>
                  </Pressable>
                );
              })}
              {error ? (
                <Text className="text-sm font-medium text-epmaps-danger">{error.message}</Text>
              ) : null}
            </View>
          )}
        />
        <View className="mt-2">
          <Button titulo="Continuar" onPress={continuar} />
        </View>
      </ScrollView>
    </View>
  );
}
