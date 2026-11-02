import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TrazoAnimado = Animated.createAnimatedComponent(Path);

export function BotonEnviarLectura({
  titulo,
  cargando,
  completado,
  onPress,
}: {
  titulo: string;
  cargando: boolean;
  completado: boolean;
  onPress: () => void;
}) {
  const [anchoMedido, setAnchoMedido] = useState(0);
  const ancho = useSharedValue(0);
  const escala = useSharedValue(1);
  const trazo = useSharedValue(24);
  const estiloBoton = useAnimatedStyle(() => ({
    width: ancho.value > 0 ? ancho.value : '100%',
  }));
  const estiloOnda = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));
  const propsTrazo = useAnimatedProps(() => ({ strokeDashoffset: trazo.value }));

  useEffect(() => {
    if (!anchoMedido) return;
    if (!completado) {
      // The first measurement establishes the expanded width without animating from zero.
      // eslint-disable-next-line react-hooks/immutability
      ancho.value = anchoMedido;
      return;
    }
    ancho.value = withTiming(56, { duration: 260 });
    // Reanimated shared values are intentionally mutated to run the success animation.
    // eslint-disable-next-line react-hooks/immutability
    trazo.value = withTiming(0, { duration: 420 });
    // eslint-disable-next-line react-hooks/immutability
    escala.value = withSequence(withSpring(1.2), withSpring(1));
  }, [ancho, anchoMedido, completado, escala, trazo]);

  return (
    <View
      className="w-full items-center"
      onLayout={(evento) => setAnchoMedido(evento.nativeEvent.layout.width)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={completado ? 'Lectura guardada' : titulo}
        accessibilityState={{ disabled: cargando || completado, busy: cargando }}
        disabled={cargando || completado}
        onPress={onPress}>
        <Animated.View
          style={estiloBoton}
          className={`h-14 items-center justify-center bg-epmaps-primary px-4 ${
            completado ? 'rounded-full' : 'rounded-2xl'
          }`}>
          {completado ? (
            <Animated.View
              style={estiloOnda}
              className="h-10 w-10 items-center justify-center rounded-full border-2 border-white/60">
              <Svg width={28} height={28} viewBox="0 0 24 24">
                <TrazoAnimado
                  d="M4.5 12.5 9.5 17 20 6.5"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={24}
                  animatedProps={propsTrazo}
                />
              </Svg>
            </Animated.View>
          ) : cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-base font-bold tracking-wide text-white">{titulo}</Text>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}
