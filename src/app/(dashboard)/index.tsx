import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';

import { Cabecera } from '@/components/Cabecera';
import { MedidorCard } from '@/components/MedidorCard';
import { Button, Card, Icon, Input, Text, type IconName } from '@/components/ui';
import { listarLecturasDeTecnico } from '@/database/repositories/lecturaRepository';
import { esCodigoMedidorValido, esDeLaJornada, LONGITUD_CODIGO_MEDIDOR } from '@/domain/medidor.rules';
import { useMedidorSearch } from '@/hooks/useMedidorSearch';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSession } from '@/hooks/useSession';
import { borradorDe } from '@/services/borradores';
import { buscarDuplicado } from '@/services/duplicados';

/** El aviso de borrador pendiente se muestra una vez por apertura de la app (R8). */
let borradorOfrecido = false;

function saludo(): string {
  const hora = new Date().getHours();
  return hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
}

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('');
}

function Indicador({ valor, etiqueta, icono }: { valor: number; etiqueta: string; icono: IconName }) {
  return (
    <View className="flex-1 rounded-2xl bg-white/10 px-3 py-3">
      <Icon name={icono} size={16} color="#7DD3FC" />
      <Text className="mt-1 text-2xl font-extrabold text-white">{valor}</Text>
      <Text className="text-[11px] font-semibold text-white/70">{etiqueta}</Text>
    </View>
  );
}

/** Identificación y consulta del medidor (R2, R3) y resumen de la jornada. */
export default function InicioScreen() {
  const db = useSQLiteContext();
  const { sesion, cerrarSesion } = useSession();
  const { pendientes, ultimaSincronizacion } = useNetworkStatus();
  const { medidor, origen, cargando, error, sinConexion, buscar, limpiar } = useMedidorSearch();
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [comprobando, setComprobando] = useState(false);
  const [hoy, setHoy] = useState({ registradas: 0, enviadas: 0 });

  // Resumen de la jornada: se recalcula al volver a la pantalla y tras cada envío.
  useFocusEffect(
    useCallback(() => {
      if (!sesion) return;
      listarLecturasDeTecnico(db, sesion.tecnico.codigo).then((lecturas) => {
        const deHoy = lecturas.filter((l) => esDeLaJornada(l.registradaEn));
        setHoy({
          registradas: deHoy.length,
          enviadas: deHoy.filter((l) => l.estadoEnvio === 'ENVIADA').length,
        });
      });
    }, [db, sesion, ultimaSincronizacion]),
  );

  const cambiarCodigo = (texto: string) => {
    setCodigo(texto.toUpperCase());
    setErrorCodigo(null);
    limpiar();
  };

  // R2: con un código incompleto o mal formado no se consulta ni se muestra ningún medidor.
  const consultar = () => {
    const limpio = codigo.trim();
    if (!esCodigoMedidorValido(limpio)) {
      limpiar();
      setErrorCodigo('El código debe ser MED- seguido de 6 dígitos. Ejemplo: MED-100001');
      return;
    }
    buscar(limpio);
  };

  // R8: al abrir la app, si quedó un registro a medias, se ofrece continuarlo o descartarlo.
  useEffect(() => {
    if (borradorOfrecido || !sesion) return;
    borradorOfrecido = true;
    borradorDe(db, sesion.tecnico.codigo).then((b) => {
      if (b) router.push('/borrador-modal');
    });
  }, [db, sesion]);

  const registrar = async () => {
    const limpio = codigo.trim();
    setComprobando(true);
    // Un registro a la vez: si hay uno a medias, primero se decide qué hacer con él (R8).
    if (sesion && (await borradorDe(db, sesion.tecnico.codigo))) {
      setComprobando(false);
      router.push('/borrador-modal');
      return;
    }
    // R10: se rechaza un segundo registro del mismo medidor en el mes.
    const duplicado = await buscarDuplicado(db, limpio, medidor);
    setComprobando(false);

    if (!duplicado) {
      router.push({ pathname: '/lectura/[codigo]', params: { codigo: limpio } });
      return;
    }
    const corregible = duplicado.lecturaLocal?.estadoEnvio === 'PENDIENTE';
    Alert.alert('Lectura ya registrada este mes', duplicado.motivo, [
      { text: 'Entendido', style: 'cancel' },
      ...(corregible
        ? [
            {
              text: 'Corregir',
              onPress: () =>
                router.push({
                  pathname: '/lectura/[codigo]',
                  params: { codigo: limpio, id: String(duplicado.lecturaLocal!.id) },
                }),
            },
          ]
        : []),
    ]);
  };

  const confirmarCierre = () => {
    Alert.alert('Cerrar sesión', 'Deberás ingresar tu código y clave nuevamente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-100">
      <Cabecera
        solapada
        antetitulo={saludo()}
        titulo={sesion?.tecnico.nombre ?? ''}
        accion={
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mis lecturas"
              onPress={() => router.push('/lecturas')}
              className="h-11 flex-row items-center gap-2 rounded-2xl bg-white px-4 active:opacity-80">
              <Icon name="list" size={18} color="#0067B1" />
              <Text className="text-sm font-bold text-epmaps-primary">Mis lecturas</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              onPress={confirmarCierre}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15 active:bg-white/25">
              <Icon name="log-out-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        }>
        <View className="mt-1 flex-row items-center gap-2">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-epmaps-secondary">
            <Text className="text-[10px] font-extrabold text-white">
              {iniciales(sesion?.tecnico.nombre ?? '')}
            </Text>
          </View>
          <Text className="text-sm font-semibold text-white/75">{sesion?.tecnico.codigo}</Text>
        </View>
        <View className="mt-5 flex-row gap-2">
          <Indicador valor={hoy.registradas} etiqueta="Registradas hoy" icono="clipboard-outline" />
          <Indicador valor={hoy.enviadas} etiqueta="Enviadas hoy" icono="cloud-done-outline" />
          <Indicador valor={pendientes} etiqueta="Por enviar" icono="time-outline" />
        </View>
      </Cabecera>

      <ScrollView
        className="-mt-8 flex-1"
        contentContainerClassName="gap-4 px-4 pb-10"
        keyboardShouldPersistTaps="handled">
        <Card className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-epmaps-sky">
              <Icon name="speedometer-outline" size={22} color="#0067B1" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-slate-900">Consultar medidor</Text>
              <Text className="text-sm text-slate-500">Escribe el código de la etiqueta.</Text>
            </View>
          </View>
          <Input
            etiqueta="Código del medidor"
            icono="barcode-outline"
            placeholder="MED-000000"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={LONGITUD_CODIGO_MEDIDOR}
            returnKeyType="search"
            value={codigo}
            onChangeText={cambiarCodigo}
            onSubmitEditing={consultar}
            error={errorCodigo}
          />
          <Button titulo="Consultar" icono="search" cargando={cargando} onPress={consultar} />
        </Card>

        {cargando ? (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#0067B1" />
          </View>
        ) : null}

        {error ? (
          <Card className="gap-4">
            <View className="flex-row gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                <Icon name={sinConexion ? 'cloud-offline-outline' : 'help-circle-outline'} size={22} color="#D32F2F" />
              </View>
              <View className="flex-1">
                <Text className="font-extrabold text-slate-900">No se pudo mostrar el medidor</Text>
                <Text className="mt-1 text-sm text-slate-600">{error}</Text>
              </View>
            </View>
            {/* R4: sin señal se puede registrar de todos modos. */}
            {sinConexion ? (
              <Button
                titulo="Registrar sin datos del medidor"
                icono="create-outline"
                variante="secundario"
                cargando={comprobando}
                onPress={registrar}
              />
            ) : null}
          </Card>
        ) : null}

        {medidor && origen ? (
          <>
            <MedidorCard medidor={medidor} origen={origen} />
            <Button
              titulo="Registrar lectura"
              icono="create-outline"
              cargando={comprobando}
              onPress={registrar}
            />
          </>
        ) : null}

        {!medidor && !error && !cargando ? (
          <View className="items-center gap-2 px-8 py-6">
            <Icon name="water-outline" size={28} color="#94A3B8" />
            <Text className="text-center text-sm text-slate-400">
              Consulta un medidor para ver sus datos y registrar la lectura del mes.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
