import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LecturaItem } from '@/components/LecturaItem';
import { Card } from '@/components/ui';
import { listarLecturasDeTecnico } from '@/database/repositories/lecturaRepository';
import type { Lectura } from '@/domain/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSession } from '@/hooks/useSession';
import { borradorDe } from '@/services/borradores';
import { volver } from '@/utils/navegacion';

/** Lecturas registradas por el técnico; las pendientes se pueden corregir (R10). */
export default function MisLecturasScreen() {
  const db = useSQLiteContext();
  const { top } = useSafeAreaInsets();
  const { sesion } = useSession();
  const { ultimaSincronizacion } = useNetworkStatus();
  const [lecturas, setLecturas] = useState<Lectura[]>([]);

  // Se recarga al volver a la pantalla y cuando termina un envío.
  useFocusEffect(
    useCallback(() => {
      if (sesion) listarLecturasDeTecnico(db, sesion.tecnico.codigo).then(setLecturas);
    }, [db, sesion, ultimaSincronizacion]),
  );

  return (
    <View className="flex-1 bg-slate-100">
      <View style={{ paddingTop: top + 8 }} className="rounded-b-[32px] bg-epmaps-primary px-5 pb-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={volver}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/15 active:bg-white/25">
          <Text className="text-xl font-bold text-white">‹</Text>
        </Pressable>
        <Text className="mt-4 text-2xl font-extrabold text-white">Mis lecturas</Text>
        <Text className="text-sm text-white/70">
          Puedes corregir una lectura mientras no se haya enviado.
        </Text>
      </View>

      <FlatList
        data={lecturas}
        keyExtractor={(l) => String(l.id)}
        contentContainerClassName="gap-3 p-4 pb-10"
        renderItem={({ item }) => (
          <LecturaItem
            lectura={item}
            onCorregir={async () => {
              // Un registro a la vez: si hay uno a medias, primero se decide qué hacer con él (R8).
              if (sesion && (await borradorDe(db, sesion.tecnico.codigo))) {
                router.push('/borrador-modal');
                return;
              }
              router.push({
                pathname: '/lectura/[codigo]',
                params: { codigo: item.codigoMedidor, id: String(item.id) },
              });
            }}
          />
        )}
        ListEmptyComponent={
          <Card>
            <Text className="text-center text-sm text-slate-500">Aún no registras lecturas.</Text>
          </Card>
        }
      />
    </View>
  );
}
