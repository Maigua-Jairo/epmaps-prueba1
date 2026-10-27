import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';

import { Cabecera } from '@/components/Cabecera';
import { LecturaItem } from '@/components/LecturaItem';
import { Card, Icon, Text } from '@/components/ui';
import { listarLecturasDeTecnico } from '@/database/repositories/lecturaRepository';
import type { Lectura } from '@/domain/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSession } from '@/hooks/useSession';
import { borradorDe } from '@/services/borradores';

/** Lecturas registradas por el técnico; las pendientes se pueden corregir (R10). */
export default function MisLecturasScreen() {
  const db = useSQLiteContext();
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
      <Cabecera
        conVolver
        titulo="Mis lecturas"
        subtitulo="Puedes corregir una lectura mientras no se haya enviado."
      />

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
          <Card className="items-center gap-2 py-8">
            <Icon name="clipboard-outline" size={36} color="#CBD5E1" />
            <Text className="text-base font-bold text-slate-700">Aún no registras lecturas</Text>
            <Text className="text-center text-sm text-slate-400">
              Las lecturas que registres aparecerán aquí con su estado de envío.
            </Text>
          </Card>
        }
      />
    </View>
  );
}
