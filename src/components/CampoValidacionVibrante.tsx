import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function CampoValidacionVibrante({
  children,
  error,
  trigger,
}: {
  children: ReactNode;
  error?: string;
  trigger: number;
}) {
  const desplazamiento = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: desplazamiento.value }],
  }));

  useEffect(() => {
    if (error) {
      // Reanimated shared values are intentionally mutated to start the field shake.
      // eslint-disable-next-line react-hooks/immutability
      desplazamiento.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [desplazamiento, error, trigger]);

  return <Animated.View style={estilo}>{children}</Animated.View>;
}
