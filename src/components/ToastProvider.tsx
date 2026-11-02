import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Notificar = (mensaje: string) => void;

const ToastContext = createContext<Notificar | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { top } = useSafeAreaInsets();
  const [mensaje, setMensaje] = useState('');
  const desplazamiento = useSharedValue(-150);
  const opacidad = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notificar = useCallback((nuevoMensaje: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMensaje(nuevoMensaje);
    // Reanimated shared values are intentionally mutated to start the toast animation.
    // eslint-disable-next-line react-hooks/immutability
    desplazamiento.value = -150;
    // eslint-disable-next-line react-hooks/immutability
    opacidad.value = 0;
    desplazamiento.value = withSequence(
      withTiming(20, { duration: 280 }),
      withDelay(3500, withTiming(-150, { duration: 280 })),
    );
    opacidad.value = withSequence(
      withTiming(1, { duration: 280 }),
      withDelay(3500, withTiming(0, { duration: 280 })),
    );
    timer.current = setTimeout(() => setMensaje(''), 4060);
  }, [desplazamiento, opacidad]);

  const estilo = useAnimatedStyle(() => ({
    opacity: opacidad.value,
    transform: [{ translateY: desplazamiento.value }],
  }));

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext value={notificar}>
      {children}
      {mensaje ? (
        <Animated.View
          pointerEvents="none"
          accessibilityRole="alert"
          style={[{ top: top + 8 }, estilo]}
          className="absolute left-4 right-4 z-50 rounded-2xl bg-epmaps-dark px-4 py-3 shadow-lg">
          <Text className="text-center text-sm font-bold text-white">{mensaje}</Text>
        </Animated.View>
      ) : null}
    </ToastContext>
  );
}

export function useToast(): Notificar {
  const notificar = use(ToastContext);
  if (!notificar) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return notificar;
}
