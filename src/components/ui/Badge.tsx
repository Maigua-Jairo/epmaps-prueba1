import { Text, View } from 'react-native';

type Tono = 'info' | 'exito' | 'advertencia' | 'peligro';

// Fondo suave del color de estado y texto oscuro: legible bajo el sol. El texto
// siempre nombra el estado, el color solo lo refuerza.
const estilos: Record<Tono, { fondo: string; texto: string }> = {
  info: { fondo: 'bg-epmaps-accent/20', texto: 'text-epmaps-dark' },
  exito: { fondo: 'bg-status-online/20', texto: 'text-emerald-900' },
  advertencia: { fondo: 'bg-status-offline/25', texto: 'text-amber-900' },
  peligro: { fondo: 'bg-status-danger/15', texto: 'text-red-800' },
};

export function Badge({ texto, tono = 'info' }: { texto: string; tono?: Tono }) {
  const estilo = estilos[tono];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${estilo.fondo}`}>
      <Text className={`text-xs font-bold ${estilo.texto}`}>{texto}</Text>
    </View>
  );
}
