import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';

import { RegistroHeader } from '@/components/RegistroHeader';
import { Badge, Button, Card, Icon, Text, type IconName } from '@/components/ui';
import {
  LecturaDuplicadaError,
  LecturaYaEnviadaError,
} from '@/database/repositories/lecturaRepository';
import { useRegistro } from '@/hooks/useLecturaForm';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

function Fila({ icono, etiqueta, valor }: { icono: IconName; etiqueta: string; valor: string }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-slate-100 py-3">
      <Icon name={icono} size={18} color="#64748B" />
      <Text className="text-sm font-medium text-slate-500">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-bold text-slate-900">{valor}</Text>
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
    <View className="flex-1 bg-slate-100">
      <RegistroHeader paso={4} titulo={original ? 'Confirmar corrección' : 'Confirmar registro'} />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <Card>
          <Fila icono="pulse-outline" etiqueta="Estado del medidor" valor={ETIQUETA_ESTADO[v.estado]} />
          {v.estado !== 'INACCESIBLE' ? (
            <Fila
              icono="speedometer-outline"
              etiqueta="Lectura actual"
              valor={calculo.lectura !== null ? `${calculo.lectura} m³` : 'Sin lectura'}
            />
          ) : null}
          {medidor && calculo.lectura !== null ? (
            <>
              <Fila icono="time-outline" etiqueta="Lectura anterior" valor={`${medidor.ultimaLectura} m³`} />
              <Fila icono="water-outline" etiqueta="Consumo del mes" valor={`${calculo.consumo} m³`} />
            </>
          ) : null}
          {v.estado === 'INACCESIBLE' ? (
            <Fila icono="lock-closed-outline" etiqueta="Motivo" valor={v.motivo} />
          ) : null}
          {v.estado === 'DANADO' ? (
            <Fila icono="construct-outline" etiqueta="Daño" valor={v.descripcion} />
          ) : null}
          <Fila icono="camera-outline" etiqueta="Foto" valor={v.fotoUri ? 'Adjunta' : 'Sin foto'} />
          {calculo.esAnomalo ? (
            <View className="mt-3">
              <Badge tono="advertencia" texto="Consumo anómalo · revisión confirmada" />
            </View>
          ) : null}
          {v.fotoUri ? (
            <Image
              source={{ uri: v.fotoUri }}
              accessibilityLabel="Foto del medidor"
              className="mt-3 h-40 w-full rounded-2xl bg-slate-200"
              resizeMode="cover"
            />
          ) : null}
        </Card>

        <View className="flex-row gap-3 rounded-3xl bg-epmaps-sky p-4">
          <Icon name="shield-checkmark-outline" size={22} color="#0067B1" />
          <Text className="flex-1 text-sm font-medium text-slate-700">
            La lectura se guarda en el teléfono y se enviará al sistema de la oficina cuando haya
            conexión. Mientras no se envíe, podrás corregirla.
          </Text>
        </View>

        {error ? (
          <View className="flex-row gap-3 rounded-2xl bg-red-50 px-4 py-3">
            <Icon name="alert-circle" size={20} color="#D32F2F" />
            <Text className="flex-1 text-sm font-semibold text-epmaps-danger">{error}</Text>
          </View>
        ) : null}

        <Button
          titulo={original ? 'Guardar corrección' : 'Registrar lectura'}
          icono="save-outline"
          cargando={guardando}
          onPress={() => registrar()}
        />
      </ScrollView>
    </View>
  );
}
