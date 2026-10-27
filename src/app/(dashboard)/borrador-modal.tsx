import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Icon, Text } from '@/components/ui';
import type { Borrador, PasoRegistro } from '@/database/repositories/borradorRepository';
import { useSession } from '@/hooks/useSession';
import { borradorDe, descartarBorrador } from '@/services/borradores';
import { volver } from '@/utils/navegacion';

const ETIQUETA_PASO: Record<PasoRegistro, string> = {
  estado: 'Estado del medidor',
  datos: 'Datos de la lectura',
  foto: 'Foto de respaldo',
  resumen: 'Confirmación',
};

const ETIQUETA_ESTADO = { NORMAL: 'Normal', INACCESIBLE: 'Inaccesible', DANADO: 'Dañado' } as const;

/** R8: la app se cerró a mitad de un registro; se ofrece continuarlo o descartarlo. */
export default function BorradorModal() {
  const db = useSQLiteContext();
  const { sesion } = useSession();
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [descartando, setDescartando] = useState(false);

  useEffect(() => {
    if (sesion) borradorDe(db, sesion.tecnico.codigo).then(setBorrador);
  }, [db, sesion]);

  const continuar = () => {
    if (!borrador) return;
    router.replace({
      pathname: '/lectura/[codigo]',
      params: {
        codigo: borrador.codigoMedidor,
        reanudar: '1',
        ...(borrador.lecturaId !== null ? { id: String(borrador.lecturaId) } : {}),
      },
    });
  };

  const descartar = async () => {
    setDescartando(true);
    await descartarBorrador(db);
    volver();
  };

  const actualizado = borrador
    ? new Date(borrador.actualizadoEn).toLocaleString('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <View className="flex-1 justify-center bg-epmaps-navy/70 p-6">
      <View className="gap-5 rounded-[28px] bg-white p-6">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
          <Icon name="document-text" size={28} color="#B45309" />
        </View>
        <View className="gap-1">
          <Text className="text-2xl font-extrabold text-slate-900">Registro sin terminar</Text>
          <Text className="text-sm text-slate-500">
            La aplicación se cerró mientras registrabas una lectura. ¿Quieres continuar donde lo
            dejaste o descartarlo?
          </Text>
        </View>

        {borrador ? (
          <View className="gap-2 rounded-2xl bg-slate-50 p-4">
            <View className="flex-row items-center gap-2">
              <Icon name="speedometer" size={18} color="#0067B1" />
              <Text className="text-lg font-extrabold text-slate-900">{borrador.codigoMedidor}</Text>
            </View>
            <Text className="text-sm text-slate-600">
              {borrador.lecturaId !== null ? 'Corrección de una lectura' : 'Lectura nueva'} · quedó en{' '}
              <Text className="font-semibold">{ETIQUETA_PASO[borrador.paso]}</Text>
            </Text>
            {borrador.datos.estado ? (
              <Text className="text-sm text-slate-600">
                Estado: {ETIQUETA_ESTADO[borrador.datos.estado]}
                {borrador.datos.lectura ? ` · lectura ${borrador.datos.lectura} m³` : ''}
                {borrador.datos.fotoUri ? ' · con foto' : ''}
              </Text>
            ) : null}
            <Text className="text-xs text-slate-400">Último cambio: {actualizado}</Text>
          </View>
        ) : null}

        <View className="gap-3">
          <Button
            titulo="Continuar registro"
            icono="play-forward"
            disabled={!borrador}
            onPress={continuar}
          />
          <Button
            titulo="Descartar"
            icono="trash-outline"
            variante="secundario"
            cargando={descartando}
            onPress={descartar}
          />
        </View>
      </View>
    </View>
  );
}
