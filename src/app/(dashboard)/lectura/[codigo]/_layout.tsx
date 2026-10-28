import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button, Card, Fondo } from '@/components/ui';
import { obtenerBorrador, type Borrador } from '@/database/repositories/borradorRepository';
import { obtenerLectura } from '@/database/repositories/lecturaRepository';
import { obtenerMedidorEnCache } from '@/database/repositories/medidorRepository';
import type { Lectura, MedidorEnCache } from '@/domain/types';
import { RegistroProvider } from '@/hooks/useLecturaForm';
import { descartarBorrador } from '@/services/borradores';
import { volver } from '@/utils/navegacion';

interface Carga {
  medidor: MedidorEnCache | null;
  original: Lectura | null;
  borrador: Borrador | null;
}

/**
 * Flujo de registro en varias pantallas.
 * - Con `id` corrige una lectura existente (R10).
 * - Con `reanudar` retoma el borrador que quedó al cerrarse la app (R8).
 * Los datos del medidor salen de la caché que llenó la consulta (R3); si no hay
 * (sin señal y sin consulta previa), se registra igual y queda pendiente de verificar (R4).
 */
export default function RegistroLayout() {
  const db = useSQLiteContext();
  const { codigo, id, reanudar } = useLocalSearchParams<{
    codigo: string;
    id?: string;
    reanudar?: string;
  }>();
  const [carga, setCarga] = useState<Carga | null>(null);

  useEffect(() => {
    Promise.all([
      obtenerMedidorEnCache(db, codigo),
      id ? obtenerLectura(db, Number(id)) : null,
      reanudar === '1' ? obtenerBorrador(db) : null,
    ]).then(async ([medidor, original, borrador]) => {
      // Corrección a medias de una lectura que se envió mientras tanto: el borrador ya no sirve.
      if (borrador && original && original.estadoEnvio !== 'PENDIENTE') await descartarBorrador(db);
      setCarga({ medidor, original, borrador });
    });
    // id y reanudar solo cuentan al abrir el flujo: las pantallas internas no los vuelven
    // a pasar y no debe recargarse el formulario al avanzar entre pasos.
  }, [db, codigo]);

  if (!carga) {
    return (
      <Fondo className="items-center justify-center">
        <ActivityIndicator size="large" color="#0455BF" />
      </Fondo>
    );
  }

  if (carga.original && carga.original.estadoEnvio !== 'PENDIENTE') {
    return (
      <Fondo className="justify-center p-6">
        <Card className="gap-4">
          <Text className="text-lg font-bold text-epmaps-dark">No se puede corregir</Text>
          <Text className="text-sm text-slate-600">
            Esta lectura ya se envió al sistema de la oficina. Solo se pueden corregir las lecturas
            que aún no se envían.
          </Text>
          <Button titulo="Volver" variante="contorno" onPress={volver} />
        </Card>
      </Fondo>
    );
  }

  return (
    <RegistroProvider
      codigo={codigo}
      medidor={carga.medidor}
      original={carga.original}
      borrador={carga.borrador}>
      <Stack screenOptions={{ headerShown: false }} />
    </RegistroProvider>
  );
}
