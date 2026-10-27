import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { obtenerMedidorEnCache } from '@/database/repositories/medidorRepository';
import type { MedidorEnCache } from '@/domain/types';
import { RegistroProvider } from '@/hooks/useLecturaForm';

/**
 * Flujo de registro en varias pantallas. Los datos del medidor salen de la caché
 * que llenó la consulta (R3); si no hay (sin señal y sin consulta previa), se
 * registra igual y la comparación queda pendiente de verificar (R4).
 */
export default function RegistroLayout() {
  const db = useSQLiteContext();
  const { codigo } = useLocalSearchParams<{ codigo: string }>();
  const [medidor, setMedidor] = useState<MedidorEnCache | null | undefined>(undefined);

  useEffect(() => {
    obtenerMedidorEnCache(db, codigo).then(setMedidor);
  }, [db, codigo]);

  if (medidor === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator size="large" color="#0067B1" />
      </View>
    );
  }

  return (
    <RegistroProvider codigo={codigo} medidor={medidor}>
      <Stack screenOptions={{ headerShown: false }} />
    </RegistroProvider>
  );
}
