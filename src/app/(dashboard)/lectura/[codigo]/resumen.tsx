import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { RegistroHeader } from '@/components/RegistroHeader';
import { Badge, Button, Card, Fondo } from '@/components/ui';
import {
  LecturaDuplicadaError,
  LecturaYaEnviadaError,
} from '@/database/repositories/lecturaRepository';
import { useRegistro } from '@/hooks/useLecturaForm';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row justify-between gap-4 border-b border-epmaps-dark/10 py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-epmaps-dark">{valor}</Text>
    </View>
  );
}

/** Paso 4: revisión final y guardado en el teléfono (R4) o corrección (R10). */
export default function ResumenScreen() {
  const { medidor, original, form, calculo, guardar, marcarPaso } = useRegistro();
  useFocusEffect(useCallback(() => marcarPaso('resumen'), [marcarPaso]));
  const { sincronizar } = useNetworkStatus();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const v = form.watch();

  const registrar = form.handleSubmit(async () => {
    setError(null);
    setGuardando(true);
    let id: number;
    try {
      id = await guardar();
    } catch (e) {
      console.error('No se pudo guardar la lectura', e);
      setError(
        e instanceof LecturaDuplicadaError || e instanceof LecturaYaEnviadaError
          ? e.message
          : `No se pudo guardar la lectura en el teléfono. Detalle: ${
              e instanceof Error ? e.message : String(e)
            }`,
      );
      setGuardando(false);
      return;
    }
    // Ya está guardada: lo que sigue no debe reportarse como un fallo al guardar.
    // Con señal se envía de inmediato; sin señal solo actualiza el contador de pendientes.
    sincronizar();
    router.replace({
      pathname: '/lectura/exito',
      params: { id: String(id), corregida: original ? '1' : '0' },
    });
  });

  return (
    <Fondo>
      <RegistroHeader paso={4} titulo={original ? 'Confirmar corrección' : 'Confirmar registro'} />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <Card>
          <Fila etiqueta="Estado del medidor" valor={ETIQUETA_ESTADO[v.estado]} />
          {v.estado !== 'INACCESIBLE' ? (
            <Fila
              etiqueta="Lectura actual"
              valor={calculo.lectura !== null ? `${calculo.lectura} m³` : 'Sin lectura'}
            />
          ) : null}
          {medidor && calculo.lectura !== null ? (
            <>
              <Fila etiqueta="Lectura anterior" valor={`${medidor.ultimaLectura} m³`} />
              <Fila etiqueta="Consumo del mes" valor={`${calculo.consumo} m³`} />
            </>
          ) : null}
          {v.estado === 'INACCESIBLE' ? <Fila etiqueta="Motivo" valor={v.motivo} /> : null}
          {v.estado === 'DANADO' ? <Fila etiqueta="Descripción del daño" valor={v.descripcion} /> : null}
          <Fila etiqueta="Foto" valor={v.fotoUri ? 'Adjunta' : 'Sin foto'} />
          {calculo.esAnomalo ? (
            <View className="mt-3">
              <Badge tono="peligro" texto="Consumo anómalo · revisión confirmada" />
            </View>
          ) : null}
          {v.fotoUri ? (
            <Image
              source={{ uri: v.fotoUri }}
              accessibilityLabel="Foto del medidor"
              className="mt-3 h-40 w-full rounded-2xl bg-epmaps-dark/10"
              resizeMode="cover"
            />
          ) : null}
        </Card>

        <Card className="border-l-4 border-epmaps-secondary">
          <Text className="text-sm text-slate-600">
            La lectura se guarda en el teléfono y se enviará al sistema de la oficina cuando haya
            conexión. Mientras no se envíe, podrás corregirla.
          </Text>
        </Card>

        {error ? (
          <View className="rounded-2xl bg-status-danger/10 px-4 py-3">
            <Text className="text-sm font-semibold text-red-700">{error}</Text>
          </View>
        ) : null}

        <Button
          titulo={original ? 'Guardar corrección' : 'Registrar lectura'}
          cargando={guardando}
          onPress={() => registrar()}
        />
      </ScrollView>
    </Fondo>
  );
}
