import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/components/ui';
import { volver } from '@/utils/navegacion';

/** Círculos translúcidos que evocan ondas de agua: la firma visual de la app. */
export function FondoAgua() {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <View className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />
      <View className="absolute -right-4 top-10 h-28 w-28 rounded-full border-[10px] border-white/5" />
      <View className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-epmaps-secondary/20" />
    </View>
  );
}

interface CabeceraProps {
  titulo: string;
  /** Texto pequeño sobre el título (p. ej. "Paso 2 de 4"). */
  antetitulo?: string;
  subtitulo?: string;
  /** Muestra el botón de volver a la izquierda. */
  conVolver?: boolean;
  /** Contenido a la derecha de la fila superior. */
  accion?: ReactNode;
  /** Espacio extra abajo para que una tarjeta se monte sobre la cabecera. */
  solapada?: boolean;
  children?: ReactNode;
}

export function Cabecera({
  titulo,
  antetitulo,
  subtitulo,
  conVolver,
  accion,
  solapada,
  children,
}: CabeceraProps) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: top + 12 }}
      className={`overflow-hidden rounded-b-[32px] bg-epmaps-primary px-5 ${solapada ? 'pb-14' : 'pb-6'}`}>
      <FondoAgua />
      {conVolver || accion ? (
        <View className="mb-4 flex-row items-center justify-between">
          {conVolver ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={volver}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15 active:bg-white/25">
              <Icon name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
          ) : (
            <View />
          )}
          {accion}
        </View>
      ) : null}
      {antetitulo ? (
        <Text className="text-xs font-bold uppercase tracking-widest text-white/70">{antetitulo}</Text>
      ) : null}
      <Text className="text-[26px] font-extrabold leading-tight text-white">{titulo}</Text>
      {subtitulo ? <Text className="mt-1 text-sm text-white/75">{subtitulo}</Text> : null}
      {children}
    </View>
  );
}
