import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Barra superior visible en todas las pantallas: conexión y lecturas por enviar (R9). */
export function NetworkStatusBar() {
  const { top } = useSafeAreaInsets();
  const { enLinea, pendientes, sincronizando, sincronizar } = useNetworkStatus();

  const fondo =
    enLinea === null ? 'bg-slate-600' : enLinea ? 'bg-emerald-700' : 'bg-amber-600';
  const estado = enLinea === null ? 'Comprobando conexión' : enLinea ? 'En línea' : 'Sin conexión';
  const cola = sincronizando
    ? 'Enviando…'
    : pendientes === 0
      ? 'Todo enviado'
      : `${pendientes} ${pendientes === 1 ? 'lectura' : 'lecturas'} por enviar`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${estado}. ${cola}.`}
      accessibilityHint="Toca para intentar enviar ahora"
      disabled={!enLinea || sincronizando || pendientes === 0}
      onPress={sincronizar}
      style={{ paddingTop: top + 4 }}
      className={`flex-row items-center justify-between px-4 pb-2 ${fondo}`}>
      <View className="flex-row items-center gap-2">
        <View className={`h-2.5 w-2.5 rounded-full ${enLinea ? 'bg-emerald-300' : 'bg-white'}`} />
        <Text className="text-sm font-bold text-white">{estado}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {sincronizando ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
        <View className="rounded-full bg-black/20 px-3 py-0.5">
          <Text className="text-xs font-bold text-white">{cola}</Text>
        </View>
      </View>
    </Pressable>
  );
}
