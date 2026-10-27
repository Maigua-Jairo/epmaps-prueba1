import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';
import { obtenerLectura } from '@/database/repositories/lecturaRepository';
import { obtenerMedidorEnCache } from '@/database/repositories/medidorRepository';
import type { Lectura, MedidorEnCache } from '@/domain/types';
import { RegistroProvider } from '@/hooks/useLecturaForm';

interface Carga {
  medidor: MedidorEnCache | null;
  original: Lectura | null;
}

/**
 * Flujo de registro en varias pantallas. Con `id` corrige una lectura existente (R10).
 * Los datos del medidor salen de la caché que llenó la consulta (R3); si no hay
 * (sin señal y sin consulta previa), se registra igual y queda pendiente de verificar (R4).
 */
export default function RegistroLayout() {
  const db = useSQLiteContext();
  const { codigo, id } = useLocalSearchParams<{ codigo: string; id?: string }>();
  const [carga, setCarga] = useState<Carga | null>(null);

  useEffect(() => {
    Promise.all([obtenerMedidorEnCache(db, codigo), id ? obtenerLectura(db, Number(id)) : null]).then(
      ([medidor, original]) => setCarga({ medidor, original }),
    );
    // El id solo cuenta al abrir el flujo: las pantallas internas no lo vuelven a pasar
    // y no debe recargarse el formulario al avanzar entre pasos.
  }, [db, codigo]);

  if (!carga) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" color="#0067B1" />
      </View>
    );
  }

  if (carga.original && carga.original.estadoEnvio !== 'PENDIENTE') {
    return (
      <View className="flex-1 justify-center bg-slate-100 p-6">
        <Card className="gap-4">
          <Text className="text-lg font-bold text-slate-900">No se puede corregir</Text>
          <Text className="text-sm text-slate-600">
            Esta lectura ya se envió al sistema de la oficina. Solo se pueden corregir las lecturas
            que aún no se envían.
          </Text>
          <Button titulo="Volver" variante="secundario" onPress={() => router.back()} />
        </Card>
      </View>
    );
  }

  return (
    <RegistroProvider codigo={codigo} medidor={carga.medidor} original={carga.original}>
      <Stack screenOptions={{ headerShown: false }} />
    </RegistroProvider>
  );
}
