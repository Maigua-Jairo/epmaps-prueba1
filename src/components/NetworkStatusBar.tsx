import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Barra superior visible en todas las pantallas: conexión y lecturas por enviar (R9). */
export function NetworkStatusBar() {
  const { top } = useSafeAreaInsets();
  const { enLinea, pendientes, sincronizando, sincronizar } = useNetworkStatus();
  const pulso = useSharedValue(0);
  const segundoPulso = useSharedValue(0);
  const activo = enLinea === true && (sincronizando || pendientes > 0);

  useEffect(() => {
    const repetir = () =>
      withRepeat(
        withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })),
        -1,
        false,
      );
    pulso.value = activo ? repetir() : 0;
    segundoPulso.value = activo ? withDelay(450, repetir()) : 0;
  }, [activo, pulso, segundoPulso]);

  const estiloPulso = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - pulso.value),
    transform: [{ scale: 1 + pulso.value * 1.5 }],
  }));
  const estiloSegundoPulso = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - segundoPulso.value),
    transform: [{ scale: 1 + segundoPulso.value * 1.5 }],
  }));

  // Sobre verde y ámbar el texto va en azul oscuro: el blanco no se lee bajo el sol.
  const comprobando = enLinea === null;
  const fondo = comprobando ? 'bg-epmaps-dark' : enLinea ? 'bg-status-online' : 'bg-status-offline';
  const texto = comprobando ? 'text-white' : 'text-epmaps-dark';
  const estado = comprobando ? 'Comprobando conexión' : enLinea ? 'En línea' : 'Sin conexión';
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
      <StatusBar style={comprobando ? 'light' : 'dark'} />
      <View className="flex-row items-center gap-2">
        <View className="h-3 w-3 items-center justify-center">
          {activo ? (
            <>
              <Animated.View
                style={estiloPulso}
                className="absolute h-3 w-3 rounded-full bg-status-online"
              />
              <Animated.View
                style={estiloSegundoPulso}
                className="absolute h-3 w-3 rounded-full bg-status-online"
              />
            </>
          ) : null}
          <View
            className={`h-2.5 w-2.5 rounded-full ${
              comprobando ? 'bg-epmaps-accent' : enLinea ? 'bg-status-online' : 'bg-status-offline'
            }`}
          />
        </View>
        <Text className={`text-sm font-bold ${texto}`}>{estado}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {sincronizando ? (
          <ActivityIndicator size="small" color={comprobando ? '#FFFFFF' : '#023373'} />
        ) : null}
        <View className="rounded-full border border-white/40 bg-white/30 px-3 py-0.5">
          <Text className={`text-xs font-bold ${texto}`}>{cola}</Text>
        </View>
      </View>
    </Pressable>
  );
}
