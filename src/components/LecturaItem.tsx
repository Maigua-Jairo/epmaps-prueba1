import { Image, View } from 'react-native';

import type { Lectura } from '@/domain/types';

import { Badge, Button, Card, Icon, Text, type IconName } from './ui';

const ESTADO: Record<Lectura['estadoMedidor'], { etiqueta: string; icono: IconName; color: string }> = {
  NORMAL: { etiqueta: 'Normal', icono: 'checkmark-circle', color: '#059669' },
  INACCESIBLE: { etiqueta: 'Inaccesible', icono: 'lock-closed', color: '#D97706' },
  DANADO: { etiqueta: 'Dañado', icono: 'construct', color: '#DC2626' },
};

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
  const estado = ESTADO[lectura.estadoMedidor];

  return (
    <Card className="gap-3">
      <View className="flex-row gap-4">
        {lectura.fotoUri ? (
          <Image
            source={{ uri: lectura.fotoUri }}
            accessibilityLabel="Foto del medidor"
            className="h-20 w-20 rounded-2xl bg-slate-200"
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-slate-50">
            <Icon name="image-outline" size={26} color="#CBD5E1" />
          </View>
        )}
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-slate-900">{lectura.codigoMedidor}</Text>
            <Text className="text-xs font-medium text-slate-400">{fechaHora(lectura.registradaEn)}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Icon name={estado.icono} size={15} color={estado.color} />
            <Text className="text-sm font-semibold text-slate-600">
              {estado.etiqueta}
              {lectura.lectura !== null ? ` · ${lectura.lectura} m³` : ''}
              {lectura.consumo !== null ? ` · consumo ${lectura.consumo} m³` : ''}
            </Text>
          </View>
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
        <Button titulo="Corregir" icono="create-outline" variante="secundario" onPress={onCorregir} />
      ) : (
        <View className="flex-row items-center gap-2">
          <Icon
            name={lectura.estadoEnvio === 'RECHAZADA' ? 'close-circle-outline' : 'lock-closed-outline'}
            size={14}
            color="#94A3B8"
          />
          <Text className="flex-1 text-xs font-medium text-slate-400">
            {lectura.estadoEnvio === 'RECHAZADA'
              ? lectura.motivoRechazo
              : 'Ya está en el sistema de la oficina: no se puede corregir.'}
          </Text>
        </View>
      )}
    </Card>
  );
}
