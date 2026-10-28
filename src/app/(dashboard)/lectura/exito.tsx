import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, Fondo } from '@/components/ui';
import { obtenerLectura } from '@/database/repositories/lecturaRepository';
import type { Lectura } from '@/domain/types';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Confirmación: la lectura quedó guardada en el teléfono y pendiente de envío. */
export default function ExitoScreen() {
  const db = useSQLiteContext();
  const { bottom } = useSafeAreaInsets();
  const { id, corregida } = useLocalSearchParams<{ id: string; corregida?: string }>();
  const { ultimaSincronizacion } = useNetworkStatus();
  const [lectura, setLectura] = useState<Lectura | null>(null);

  // Se recarga al terminar cada sincronización para mostrar si ya se envió.
  useEffect(() => {
    obtenerLectura(db, Number(id)).then(setLectura);
  }, [db, id, ultimaSincronizacion]);

  return (
    <Fondo style={{ paddingBottom: bottom + 16 }} className="justify-between px-6">
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-24 w-24 items-center justify-center rounded-full border border-white bg-status-online/20">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-status-online">
            <Text className="text-3xl font-bold text-white">✓</Text>
          </View>
        </View>
        <Text className="text-3xl font-extrabold text-epmaps-dark">
          {corregida === '1' ? 'Lectura corregida' : 'Lectura registrada'}
        </Text>
        <Text className="text-center text-base font-semibold text-epmaps-secondary">{lectura?.codigoMedidor}</Text>

        {lectura ? (
          <Card className="mt-2 w-full gap-3">
            {lectura.consumo !== null ? (
              <Text className="text-center text-sm text-slate-500">
                Consumo del mes:{' '}
                <Text className="font-bold text-epmaps-dark">{lectura.consumo} m³</Text>
              </Text>
            ) : null}
            <View className="flex-row flex-wrap justify-center gap-2">
              {lectura.estadoEnvio === 'ENVIADA' ? (
                <Badge tono="exito" texto="Enviada a la oficina" />
              ) : lectura.estadoEnvio === 'RECHAZADA' ? (
                <Badge tono="peligro" texto="Rechazada: ya existía la lectura del mes" />
              ) : (
                <Badge tono="advertencia" texto="Pendiente de envío" />
              )}
              {lectura.verificacion === 'PENDIENTE_VERIFICAR' ? (
                <Badge tono="info" texto="Pendiente de verificar" />
              ) : lectura.verificacion === 'REQUIERE_REVISION' ? (
                <Badge tono="peligro" texto="Requiere revisión" />
              ) : (
                <Badge tono="exito" texto="Verificada con la lectura anterior" />
              )}
              {lectura.esAnomalo ? <Badge tono="peligro" texto="Consumo anómalo" /> : null}
            </View>
          </Card>
        ) : null}
      </View>

      <Button titulo="Registrar otro medidor" onPress={() => router.dismissTo('/')} />
    </Fondo>
  );
}
