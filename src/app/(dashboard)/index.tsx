import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/hooks/useSession';

/** Pantalla principal del técnico. La búsqueda de medidores llega en la Fase 2. */
export default function InicioScreen() {
  const { top } = useSafeAreaInsets();
  const { sesion, cerrarSesion } = useSession();

  const confirmarCierre = () => {
    Alert.alert('Cerrar sesión', 'Deberás ingresar tu código y clave nuevamente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-100">
      <View style={{ paddingTop: top + 16 }} className="rounded-b-[32px] bg-epmaps-primary px-6 pb-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-white/70">Técnico en jornada</Text>
            <Text className="text-2xl font-bold text-white">{sesion?.tecnico.nombre}</Text>
            <Text className="text-sm font-medium text-white/70">{sesion?.tecnico.codigo}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={confirmarCierre}
            className="rounded-full bg-white/15 px-4 py-2 active:bg-white/25">
            <Text className="text-sm font-semibold text-white">Salir</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
