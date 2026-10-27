import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FondoAgua } from '@/components/Cabecera';
import { Badge, Button, Card, Icon, Text } from '@/components/ui';
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
    <View
      style={{ paddingBottom: bottom + 16 }}
      className="flex-1 justify-between overflow-hidden bg-epmaps-primary px-6">
      <FondoAgua />
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-28 w-28 items-center justify-center rounded-full bg-white/10">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-400">
            <Icon name="checkmark" size={44} color="#FFFFFF" />
          </View>
        </View>
        <Text className="text-3xl font-extrabold text-white">
          {corregida === '1' ? 'Lectura corregida' : 'Lectura registrada'}
        </Text>
        <View className="rounded-full bg-white/15 px-4 py-1.5">
          <Text className="text-sm font-extrabold tracking-wider text-white">{lectura?.codigoMedidor}</Text>
        </View>

        {lectura ? (
          <Card className="mt-2 w-full gap-4">
            {lectura.consumo !== null ? (
              <View className="items-center">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Consumo del mes
                </Text>
                <Text className="text-4xl font-extrabold text-epmaps-navy">
                  {lectura.consumo}
                  <Text className="text-lg font-bold text-slate-400"> m³</Text>
                </Text>
              </View>
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

      <Button
        titulo="Registrar otro medidor"
        icono="add-circle-outline"
        variante="claro"
        onPress={() => router.dismissTo('/')}
      />
    </View>
  );
}
