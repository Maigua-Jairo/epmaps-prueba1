import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useRegistro } from '@/hooks/useLecturaForm';

import { Cabecera } from './Cabecera';

export const TOTAL_PASOS = 4;
const NOMBRES_PASOS = ['Estado', 'Datos', 'Foto', 'Confirmar'];

/** Cabecera del registro de lectura con el avance por pasos. */
export function RegistroHeader({ paso, titulo }: { paso: number; titulo: string }) {
  const { codigo, original } = useRegistro();

  return (
    <Cabecera
      conVolver
      accion={
        <View className="rounded-full bg-white/15 px-3 py-1.5">
          <Text className="text-xs font-extrabold tracking-wider text-white">
            {original ? 'CORRIGIENDO · ' : ''}
            {codigo}
          </Text>
        </View>
      }
      antetitulo={`Paso ${paso} de ${TOTAL_PASOS}`}
      titulo={titulo}>
      <View className="mt-5 flex-row gap-2">
        {NOMBRES_PASOS.map((nombre, i) => (
          <View key={nombre} className="flex-1 gap-1.5">
            <View
              className={`h-1.5 rounded-full ${i < paso ? 'bg-epmaps-secondary' : 'bg-white/20'}`}
            />
            <Text
              className={`text-[11px] font-bold ${i + 1 === paso ? 'text-white' : 'text-white/50'}`}>
              {nombre}
            </Text>
          </View>
        ))}
      </View>
    </Cabecera>
  );
}
