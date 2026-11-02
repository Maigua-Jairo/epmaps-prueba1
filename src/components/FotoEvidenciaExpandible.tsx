import { useCallback, useMemo, useState } from 'react';
import { Image, Modal, Pressable, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function FotoEvidenciaExpandible({ uri }: { uri: string }) {
  const { width, height } = useWindowDimensions();
  const [expandida, setExpandida] = useState(false);
  const desplazamiento = useSharedValue(0);
  const escala = useSharedValue(0.88);
  const opacidadFondo = useSharedValue(0);

  const cerrar = useCallback(() => {
    // Reanimated shared values are intentionally mutated to animate the close gesture.
    // eslint-disable-next-line react-hooks/immutability
    opacidadFondo.value = withTiming(0, { duration: 180 }, (terminada) => {
      if (terminada) runOnJS(setExpandida)(false);
    });
    // eslint-disable-next-line react-hooks/immutability
    escala.value = withSpring(0.88);
    // eslint-disable-next-line react-hooks/immutability
    desplazamiento.value = withSpring(0);
  }, [desplazamiento, escala, opacidadFondo]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((evento) => {
          // eslint-disable-next-line react-hooks/immutability
          desplazamiento.value = Math.max(0, evento.translationY);
        })
        .onEnd(() => {
          if (desplazamiento.value > 110) {
            runOnJS(cerrar)();
          } else {
            // eslint-disable-next-line react-hooks/immutability
            desplazamiento.value = withSpring(0, { damping: 18, stiffness: 180 });
          }
        }),
    [cerrar, desplazamiento],
  );

  const fondoAnimado = useAnimatedStyle(() => ({ opacity: opacidadFondo.value }));
  const fotoAnimada = useAnimatedStyle(() => ({
    opacity: opacidadFondo.value,
    transform: [
      { translateY: desplazamiento.value },
      {
        scale:
          escala.value *
          interpolate(desplazamiento.value, [0, 220], [1, 0.72], Extrapolation.CLAMP),
      },
    ],
  }));

  const abrir = () => {
    // Reanimated shared values are intentionally mutated when opening the image.
    // eslint-disable-next-line react-hooks/immutability
    desplazamiento.value = 0;
    // eslint-disable-next-line react-hooks/immutability
    escala.value = 0.88;
    // eslint-disable-next-line react-hooks/immutability
    opacidadFondo.value = 0;
    setExpandida(true);
    escala.value = withSpring(1, { damping: 16, stiffness: 150 });
    opacidadFondo.value = withTiming(1, { duration: 220 });
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ampliar foto del medidor"
        onPress={abrir}
        className="mt-3 overflow-hidden rounded-2xl">
        <Image
          source={{ uri }}
          accessibilityLabel="Foto del medidor"
          className="h-40 w-full bg-epmaps-dark/10"
          resizeMode="cover"
        />
      </Pressable>
      <Modal
        visible={expandida}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={cerrar}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View
            style={[{ backgroundColor: 'rgba(0,0,0,0.72)' }, fondoAnimado]}
            className="flex-1 items-center justify-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar foto ampliada"
              onPress={cerrar}
              className="absolute inset-0"
            />
            <GestureDetector gesture={pan}>
              <Animated.View
                style={[
                  { width: width - 32, height: height * 0.72 },
                  fotoAnimada,
                ]}
                className="overflow-hidden rounded-2xl bg-epmaps-dark/20">
                <Image source={{ uri }} className="h-full w-full" resizeMode="contain" />
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
