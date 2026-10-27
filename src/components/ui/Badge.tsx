import { View } from 'react-native';

import { Text } from './Text';

type Tono = 'info' | 'exito' | 'advertencia' | 'peligro';

const estilos: Record<Tono, { fondo: string; texto: string }> = {
  info: { fondo: 'bg-sky-100', texto: 'text-sky-800' },
  exito: { fondo: 'bg-emerald-100', texto: 'text-emerald-800' },
  advertencia: { fondo: 'bg-amber-100', texto: 'text-amber-800' },
  peligro: { fondo: 'bg-red-100', texto: 'text-red-800' },
};

export function Badge({ texto, tono = 'info' }: { texto: string; tono?: Tono }) {
  const estilo = estilos[tono];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${estilo.fondo}`}>
      <Text className={`text-xs font-bold ${estilo.texto}`}>{texto}</Text>
    </View>
  );
}
