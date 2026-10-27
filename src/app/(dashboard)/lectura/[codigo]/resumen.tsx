import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { RegistroHeader } from '@/components/RegistroHeader';
import { Badge, Button, Card } from '@/components/ui';
import { LecturaDuplicadaError } from '@/database/repositories/lecturaRepository';
import { useRegistro } from '@/hooks/useLecturaForm';

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row justify-between gap-4 border-b border-slate-100 py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-slate-900">{valor}</Text>
    </View>
  );
}

/** Paso 3: revisión final y guardado en el teléfono (R4). */
export default function ResumenScreen() {
  const { medidor, form, calculo, guardar } = useRegistro();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const v = form.watch();

  const registrar = form.handleSubmit(async () => {
    setError(null);
    setGuardando(true);
    try {
      const id = await guardar();
      router.replace({ pathname: '/lectura/exito', params: { id: String(id) } });
    } catch (e) {
      setError(
        e instanceof LecturaDuplicadaError ? e.message : 'No se pudo guardar la lectura en el teléfono',
      );
      setGuardando(false);
    }
  });

  return (
    <View className="flex-1 bg-slate-100">
      <RegistroHeader paso={3} titulo="Confirmar registro" />
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
          {calculo.esAnomalo ? (
            <View className="mt-3">
              <Badge tono="advertencia" texto="Consumo anómalo · revisión confirmada" />
            </View>
          ) : null}
        </Card>

        <Card className="border-l-4 border-epmaps-secondary">
          <Text className="text-sm text-slate-600">
            La lectura se guarda en el teléfono y se enviará al sistema de la oficina cuando haya
            conexión. Mientras no se envíe, podrás corregirla.
          </Text>
        </Card>

        {error ? (
          <View className="rounded-2xl bg-red-50 px-4 py-3">
            <Text className="text-sm font-medium text-epmaps-danger">{error}</Text>
          </View>
        ) : null}

        <Button titulo="Registrar lectura" cargando={guardando} onPress={() => registrar()} />
      </ScrollView>
    </View>
  );
}
