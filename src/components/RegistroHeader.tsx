import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRegistro } from '@/hooks/useLecturaForm';

export const TOTAL_PASOS = 3;

/** Cabecera del registro de lectura con el avance por pasos. */
export function RegistroHeader({ paso, titulo }: { paso: number; titulo: string }) {
  const { top } = useSafeAreaInsets();
  const { codigo } = useRegistro();

  return (
    <View style={{ paddingTop: top + 8 }} className="rounded-b-[32px] bg-epmaps-primary px-5 pb-6">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:bg-white/25">
          <Text className="text-xl font-bold text-white">‹</Text>
        </Pressable>
        <Text className="text-sm font-bold tracking-wider text-white/80">{codigo}</Text>
        <View className="w-10" />
      </View>

      <Text className="mt-4 text-xs font-bold uppercase tracking-widest text-white/70">
        Paso {paso} de {TOTAL_PASOS}
      </Text>
      <Text className="text-2xl font-extrabold text-white">{titulo}</Text>

      <View className="mt-4 flex-row gap-2">
        {Array.from({ length: TOTAL_PASOS }, (_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < paso ? 'bg-epmaps-secondary' : 'bg-white/25'}`}
          />
        ))}
      </View>
    </View>
  );
}
