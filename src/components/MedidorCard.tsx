import { View } from 'react-native';

import type { MedidorEnCache } from '@/domain/types';
import type { OrigenMedidor } from '@/hooks/useMedidorSearch';

import { Badge, Card, Icon, Text, type IconName } from './ui';

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

function Dato({ icono, etiqueta, valor }: { icono: IconName; etiqueta: string; valor: string }) {
  return (
    <View className="flex-row items-center gap-3 border-b border-slate-100 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
        <Icon name={icono} size={18} color="#64748B" />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-semibold text-slate-400">{etiqueta}</Text>
        <Text className="text-sm font-bold text-slate-900">{valor}</Text>
      </View>
    </View>
  );
}

function Metrica({ etiqueta, valor, unidad }: { etiqueta: string; valor: number; unidad: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-epmaps-sky p-4">
      <Text className="text-[11px] font-bold uppercase tracking-wider text-epmaps-primary">{etiqueta}</Text>
      <Text className="mt-1 text-[26px] font-extrabold text-epmaps-navy">
        {valor.toLocaleString('es-EC')}
        <Text className="text-sm font-bold text-slate-500"> {unidad}</Text>
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
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-epmaps-primary">
            <Icon name="speedometer" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Medidor</Text>
            <Text className="text-xl font-extrabold text-slate-900">{medidor.codigo}</Text>
          </View>
        </View>
        <Badge texto={medidor.estado} tono={activo ? 'exito' : 'peligro'} />
      </View>

      <View className="flex-row gap-3">
        <Metrica etiqueta="Última lectura" valor={medidor.ultimaLectura} unidad="m³" />
        <Metrica etiqueta="Promedio mensual" valor={medidor.consumoPromedio} unidad="m³" />
      </View>

      <View>
        <Dato icono="calendar-outline" etiqueta="Fecha de la última lectura" valor={fecha(medidor.fechaUltimaLectura)} />
        <Dato icono="location-outline" etiqueta="Dirección" valor={medidor.direccion} />
        <Dato icono="map-outline" etiqueta="Sector" valor={medidor.sector} />
        <Dato icono="card-outline" etiqueta="Número de cuenta" valor={medidor.numeroCuenta} />
      </View>

      <View className="flex-row items-center gap-2">
        <Icon
          name={origen === 'red' ? 'cloud-download-outline' : 'phone-portrait-outline'}
          size={16}
          color={origen === 'red' ? '#0369A1' : '#B45309'}
        />
        <Text className={`flex-1 text-xs font-semibold ${origen === 'red' ? 'text-sky-700' : 'text-amber-700'}`}>
          {origen === 'red'
            ? 'Descargado del sistema de la oficina'
            : `Guardado en el teléfono · ${fecha(medidor.consultadoEn)} ${hora(medidor.consultadoEn)}`}
        </Text>
      </View>
    </Card>
  );
}
