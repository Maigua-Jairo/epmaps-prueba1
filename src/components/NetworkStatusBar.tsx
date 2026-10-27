import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text, type IconName } from '@/components/ui';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Barra superior visible en todas las pantallas: conexión y lecturas por enviar (R9). */
export function NetworkStatusBar() {
  const { top } = useSafeAreaInsets();
  const { enLinea, pendientes, sincronizando, sincronizar } = useNetworkStatus();

  const fondo = enLinea === null ? 'bg-slate-700' : enLinea ? 'bg-epmaps-navy' : 'bg-amber-600';
  const estado = enLinea === null ? 'Comprobando conexión' : enLinea ? 'En línea' : 'Sin conexión';
  const icono: IconName = enLinea === false ? 'cloud-offline' : 'cloud-done';
  const cola = sincronizando
    ? 'Enviando…'
    : pendientes === 0
      ? 'Todo enviado'
      : `${pendientes} por enviar`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${estado}. ${pendientes} ${pendientes === 1 ? 'lectura' : 'lecturas'} por enviar.`}
      accessibilityHint="Toca para intentar enviar ahora"
      disabled={!enLinea || sincronizando || pendientes === 0}
      onPress={sincronizar}
      style={{ paddingTop: top + 6 }}
      className={`flex-row items-center justify-between px-4 pb-2.5 ${fondo}`}>
      <View className="flex-row items-center gap-2">
        <Icon name={icono} size={18} color={enLinea ? '#6EE7B7' : '#FFFFFF'} />
        <Text className="text-sm font-bold text-white">{estado}</Text>
      </View>
      <View
        className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${
          pendientes > 0 ? 'bg-amber-400' : 'bg-white/15'
        }`}>
        {sincronizando ? (
          <ActivityIndicator size="small" color={pendientes > 0 ? '#0A2A4A' : '#FFFFFF'} />
        ) : (
          <Icon
            name={pendientes > 0 ? 'time' : 'checkmark-done'}
            size={14}
            color={pendientes > 0 ? '#0A2A4A' : '#FFFFFF'}
          />
        )}
        <Text className={`text-xs font-extrabold ${pendientes > 0 ? 'text-epmaps-navy' : 'text-white'}`}>
          {cola}
        </Text>
      </View>
    </Pressable>
  );
}
