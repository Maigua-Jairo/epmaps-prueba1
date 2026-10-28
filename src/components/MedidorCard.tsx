import { Text, View } from 'react-native';

import type { MedidorEnCache } from '@/domain/types';
import type { OrigenMedidor } from '@/hooks/useMedidorSearch';

import { Badge, Card } from './ui';

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-slate-100 py-3">
      <Text className="text-sm text-slate-500">{etiqueta}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-slate-900">{valor}</Text>
    </View>
  );
}

function Metrica({ etiqueta, valor, unidad }: { etiqueta: string; valor: number; unidad: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-sky-50 p-4">
      <Text className="text-xs font-bold uppercase tracking-wider text-sky-700">{etiqueta}</Text>
      <Text className="mt-1 text-2xl font-extrabold text-slate-900">
        {valor.toLocaleString('es-EC')}
        <Text className="text-sm font-semibold text-slate-500"> {unidad}</Text>
      </Text>
    </View>
  );
}

/** Los siete datos del medidor que envía la oficina (R3). */
export function MedidorCard({ medidor, origen }: { medidor: MedidorEnCache; origen: OrigenMedidor }) {
  const activo = medidor.estado.toUpperCase() === 'ACTIVO';

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Medidor</Text>
          <Text className="text-2xl font-extrabold tracking-tight text-slate-900">{medidor.codigo}</Text>
        </View>
        <Badge texto={medidor.estado} tono={activo ? 'exito' : 'peligro'} />
      </View>

      <View className="flex-row gap-3">
        <Metrica etiqueta="Última lectura" valor={medidor.ultimaLectura} unidad="m³" />
        <Metrica etiqueta="Promedio mensual" valor={medidor.consumoPromedio} unidad="m³" />
      </View>

      <View>
        <Dato etiqueta="Fecha última lectura" valor={fecha(medidor.fechaUltimaLectura)} />
        <Dato etiqueta="Dirección" valor={medidor.direccion} />
        <Dato etiqueta="Sector" valor={medidor.sector} />
        <Dato etiqueta="N.º de cuenta" valor={medidor.numeroCuenta} />
      </View>

      <Badge
        tono={origen === 'red' ? 'info' : 'advertencia'}
        texto={
          origen === 'red'
            ? 'Descargado del sistema de la oficina'
            : `Guardado en el teléfono · ${fecha(medidor.consultadoEn)} ${hora(medidor.consultadoEn)}`
        }
      />
    </Card>
  );
}
