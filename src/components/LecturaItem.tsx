import { Image, Text, View } from 'react-native';

import type { Lectura } from '@/domain/types';

import { Badge, Button, Card } from './ui';

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

function BadgeEnvio({ lectura }: { lectura: Lectura }) {
  if (lectura.estadoEnvio === 'ENVIADA') return <Badge tono="exito" texto="Enviada" />;
  if (lectura.estadoEnvio === 'RECHAZADA') return <Badge tono="peligro" texto="Rechazada" />;
  return <Badge tono="advertencia" texto="Pendiente de envío" />;
}

/** Una lectura del técnico; solo las pendientes ofrecen corregir (R10). */
export function LecturaItem({ lectura, onCorregir }: { lectura: Lectura; onCorregir: () => void }) {
  const pendiente = lectura.estadoEnvio === 'PENDIENTE';

  return (
    <Card className="gap-3">
      <View className="flex-row gap-4">
        {lectura.fotoUri ? (
          <Image
            source={{ uri: lectura.fotoUri }}
            accessibilityLabel="Foto del medidor"
            className="h-20 w-20 rounded-2xl bg-slate-200"
          />
        ) : null}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-slate-900">{lectura.codigoMedidor}</Text>
            <Text className="text-xs text-slate-400">{fechaHora(lectura.registradaEn)}</Text>
          </View>
          <Text className="text-sm text-slate-600">
            {ETIQUETA_ESTADO[lectura.estadoMedidor]}
            {lectura.lectura !== null ? ` · ${lectura.lectura} m³` : ''}
            {lectura.consumo !== null ? ` · consumo ${lectura.consumo} m³` : ''}
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            <BadgeEnvio lectura={lectura} />
            {lectura.verificacion === 'PENDIENTE_VERIFICAR' ? (
              <Badge tono="info" texto="Por verificar" />
            ) : null}
            {lectura.verificacion === 'REQUIERE_REVISION' ? (
              <Badge tono="peligro" texto="Requiere revisión" />
            ) : null}
            {lectura.esAnomalo ? <Badge tono="advertencia" texto="Consumo anómalo" /> : null}
          </View>
        </View>
      </View>

      {pendiente ? (
        <Button titulo="Corregir" variante="secundario" onPress={onCorregir} />
      ) : (
        <Text className="text-xs text-slate-400">
          {lectura.estadoEnvio === 'RECHAZADA'
            ? lectura.motivoRechazo
            : 'Ya está en el sistema de la oficina: no se puede corregir.'}
        </Text>
      )}
    </Card>
  );
}
