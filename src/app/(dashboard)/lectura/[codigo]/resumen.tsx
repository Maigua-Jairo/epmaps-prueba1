import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BotonEnviarLectura } from '@/components/BotonEnviarLectura';
import { FotoEvidenciaExpandible } from '@/components/FotoEvidenciaExpandible';
import { PasoAnimado } from '@/components/PasoAnimado';
import { RegistroHeader } from '@/components/RegistroHeader';
import { useToast } from '@/components/ToastProvider';
import { Badge, Card, Fondo } from '@/components/ui';
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
  const notificar = useToast();
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guardadoEnCurso = useRef(false);
  const v = form.watch();

  // The ref prevents duplicate writes before React can render the disabled button.
  // eslint-disable-next-line react-hooks/refs
  const registrar = form.handleSubmit(async () => {
    if (guardadoEnCurso.current) return;
    guardadoEnCurso.current = true;
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
      guardadoEnCurso.current = false;
      return;
    }
    setGuardando(false);
    setGuardado(true);
    notificar('Lectura guardada en SQLite');
    await new Promise<void>((resolver) => setTimeout(resolver, 650));
    // Ya está guardada: un fallo del envío no debe reportarse como fallo al guardar.
    void sincronizar().catch((errorSincronizacion) => {
      console.warn('La lectura quedó guardada; se reintentará la sincronización', errorSincronizacion);
      notificar('Lectura guardada; envío pendiente de conexión');
    });
    router.replace({
      pathname: '/lectura/exito',
      params: { id: String(id), corregida: original ? '1' : '0' },
    });
  });

  return (
    <Fondo>
    <PasoAnimado>
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
            <FotoEvidenciaExpandible uri={v.fotoUri} />
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

        <BotonEnviarLectura
          titulo={original ? 'Guardar corrección' : 'Registrar lectura'}
          cargando={guardando}
          completado={guardado}
          onPress={() => registrar()}
        />
        </ScrollView>
      </PasoAnimado>
    </Fondo>
  );
}
