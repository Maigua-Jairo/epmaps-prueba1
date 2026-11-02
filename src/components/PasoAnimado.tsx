import type { ReactNode } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';

/** Reanimated acompaña la transición direccional del Stack al entrar a cada paso. */
export function PasoAnimado({ children }: { children: ReactNode }) {
  return (
    <Animated.View entering={FadeInRight.duration(220)} className="flex-1">
      {children}
    </Animated.View>
  );
}
