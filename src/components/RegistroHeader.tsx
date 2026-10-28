import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRegistro } from '@/hooks/useLecturaForm';
import { volver } from '@/utils/navegacion';

import { ReflejosCabecera } from './ui';

export const TOTAL_PASOS = 4;

/** Cabecera del registro de lectura con el avance por pasos. */
export function RegistroHeader({ paso, titulo }: { paso: number; titulo: string }) {
  const { top } = useSafeAreaInsets();
  const { codigo } = useRegistro();

  return (
    <View
      style={{ paddingTop: top + 8 }}
      className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-5 pb-6">
      <ReflejosCabecera />
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 active:bg-white/25">
          <Text className="text-xl font-bold text-white">‹</Text>
        </Pressable>
        <View className="rounded-full border border-white/25 bg-white/15 px-3 py-1">
          <Text className="text-sm font-bold tracking-wider text-white">{codigo}</Text>
        </View>
        <View className="w-11" />
      </View>

      <Text className="mt-4 text-xs font-bold uppercase tracking-widest text-epmaps-accent">
        Paso {paso} de {TOTAL_PASOS}
      </Text>
      <Text className="text-2xl font-extrabold text-white">{titulo}</Text>

      <View className="mt-4 flex-row gap-2">
        {Array.from({ length: TOTAL_PASOS }, (_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < paso ? 'bg-epmaps-accent' : 'bg-white/20'}`}
          />
        ))}
      </View>
    </View>
  );
}
