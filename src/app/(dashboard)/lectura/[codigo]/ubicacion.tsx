import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';

import { ObteniendoUbicacionAnimation } from '@/components/FeedbackAnimations';
import { MapaLectura } from '@/components/mapa/MapaLectura';
import { PasoAnimado } from '@/components/PasoAnimado';
import { RegistroHeader } from '@/components/RegistroHeader';
import { Badge, Button, Card, Fondo } from '@/components/ui';
import { useRegistro } from '@/hooks/useLecturaForm';

/** Centro de Quito, usado si no hay GPS ni permiso. */
const CENTRO_QUITO = { latitud: -0.2295, longitud: -78.5249 };

type Estado = 'buscando' | 'gps' | 'sin-gps';

interface Posicion {
  latitud: number;
  longitud: number;
}

async function obtenerCoordenadasGps(): Promise<Posicion | null> {
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (permiso.status !== 'granted') return null;

  const posicion = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
}

/** Paso 4: ubicación del medidor, por GPS o marcada a mano (Taller 7). */
export default function UbicacionScreen() {
  const { codigo, form, marcarPaso } = useRegistro();
  useFocusEffect(useCallback(() => marcarPaso('ubicacion'), [marcarPaso]));

  const latitud = useWatch({ control: form.control, name: 'latitud' });
  const longitud = useWatch({ control: form.control, name: 'longitud' });
  const origen = useWatch({ control: form.control, name: 'ubicacionOrigen' });

  const [estado, setEstado] = useState<Estado>('buscando');
  const [obteniendoGps, setObteniendoGps] = useState(true);
  const [errorGps, setErrorGps] = useState<string | null>(null);
  // Posición con la que se dibuja el mapa. Se fija una sola vez: el mapa no debe recrearse al mover el marcador.
  const [inicial, setInicial] = useState<Posicion | null>(null);
  const [revisionMapa, setRevisionMapa] = useState(0);

  const establecerUbicacionGps = useCallback((gps: Posicion) => {
    form.setValue('latitud', gps.latitud, { shouldDirty: true });
    form.setValue('longitud', gps.longitud, { shouldDirty: true });
    form.setValue('ubicacionOrigen', 'GPS', { shouldDirty: true });
    setInicial(gps);
    setEstado('gps');
    setErrorGps(null);
    setRevisionMapa((revision) => revision + 1);
  }, [form]);

  useEffect(() => {
    let cancelado = false;
    const inicializarUbicacion = async () => {
      try {
        const gps = await obtenerCoordenadasGps();
        if (cancelado) return;
        if (gps) {
          establecerUbicacionGps(gps);
        } else {
          setInicial(CENTRO_QUITO);
          setEstado('sin-gps');
          setErrorGps('Permite el acceso a la ubicación o marca el punto directamente en el mapa.');
        }
      } catch (error) {
        if (cancelado) return;
        console.warn('No se pudo obtener la ubicación GPS', error);
        setInicial(CENTRO_QUITO);
        setEstado('sin-gps');
        setErrorGps('No se pudo obtener el GPS. Puedes seleccionar el punto manualmente en el mapa.');
      } finally {
        if (!cancelado) setObteniendoGps(false);
      }
    };
    void inicializarUbicacion();
    return () => {
      cancelado = true;
    };
  }, [establecerUbicacionGps]);

  const actualizarUbicacionGps = async () => {
    setObteniendoGps(true);
    setErrorGps(null);
    try {
      const gps = await obtenerCoordenadasGps();
      if (!gps) {
        setEstado('sin-gps');
        setErrorGps('Permite el acceso a la ubicación o marca el punto directamente en el mapa.');
        return;
      }
      establecerUbicacionGps(gps);
    } catch (error) {
      console.warn('No se pudo actualizar la ubicación GPS', error);
      setEstado('sin-gps');
      setErrorGps('No se pudo obtener el GPS. Puedes seleccionar el punto manualmente en el mapa.');
    } finally {
      setObteniendoGps(false);
    }
  };

  // El técnico movió el marcador: la ubicación pasa a ser manual.
  const cambiarManual = (lat: number, lng: number) => {
    form.setValue('latitud', lat, { shouldDirty: true });
    form.setValue('longitud', lng, { shouldDirty: true });
    form.setValue('ubicacionOrigen', 'MANUAL', { shouldDirty: true });
  };

  const tieneUbicacion = typeof latitud === 'number' && typeof longitud === 'number';

  const continuar = () => {
    if (!tieneUbicacion) return;
    router.push({ pathname: '/lectura/[codigo]/resumen', params: { codigo } });
  };

  const textoEstado =
    estado === 'buscando'
      ? 'Obteniendo tu ubicación…'
      : estado === 'sin-gps'
        ? 'No se pudo usar el GPS. Marca la ubicación del medidor en el mapa.'
        : origen === 'MANUAL'
          ? 'Ubicación marcada a mano.'
          : 'Ubicación obtenida por GPS. Puedes mover el marcador si no coincide.';

  const badge =
    estado === 'buscando'
      ? { tono: 'info' as const, texto: 'Buscando GPS' }
      : estado === 'sin-gps'
        ? { tono: 'advertencia' as const, texto: 'Marcado manual' }
        : origen === 'MANUAL'
          ? { tono: 'advertencia' as const, texto: 'Marcado manual' }
          : { tono: 'exito' as const, texto: 'GPS' };

  return (
    <Fondo>
      <PasoAnimado>
        <RegistroHeader paso={4} titulo="Ubicación del medidor" />
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
          <Card className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-epmaps-accent/15">
                <Text accessibilityLabel="Ubicación" className="text-2xl">📍</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-base font-bold text-epmaps-dark">Ubicación del medidor</Text>
                <Badge tono={badge.tono} texto={badge.texto} />
              </View>
            </View>
            <Text className="text-sm leading-5 text-slate-600">{errorGps ?? textoEstado}</Text>
            {obteniendoGps ? (
              <View className="items-center">
                <ObteniendoUbicacionAnimation />
                <Text className="text-xs font-semibold text-epmaps-primary">Buscando señal GPS…</Text>
              </View>
            ) : null}
          </Card>

          {inicial ? (
            <>
              <View
                key={revisionMapa}
                className="overflow-hidden rounded-3xl border border-white"
                style={{ height: 320 }}>
                <MapaLectura
                  latitud={inicial.latitud}
                  longitud={inicial.longitud}
                  editable
                  onCambiar={cambiarManual}
                />
              </View>

              <Card className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-bold text-epmaps-dark">Coordenadas seleccionadas</Text>
                  {origen ? (
                    <Badge
                      tono={origen === 'GPS' ? 'exito' : 'advertencia'}
                      texto={origen === 'GPS' ? 'GPS' : 'Manual'}
                    />
                  ) : null}
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1 rounded-2xl bg-epmaps-primary/5 p-3">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Latitud
                    </Text>
                    <Text className="font-bold text-epmaps-dark">
                      {typeof latitud === 'number' ? latitud.toFixed(6) : 'Pendiente'}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1 rounded-2xl bg-epmaps-primary/5 p-3">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Longitud
                    </Text>
                    <Text className="font-bold text-epmaps-dark">
                      {typeof longitud === 'number' ? longitud.toFixed(6) : 'Pendiente'}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500">
                  Toca el mapa o arrastra el marcador para ajustar el punto.
                </Text>
              </Card>
            </>
          ) : (
            <Card>
              <Text className="text-sm text-slate-500">Cargando mapa…</Text>
            </Card>
          )}

          <Button
            titulo="⌖  Usar mi ubicación GPS"
            variante="contorno"
            disabled={obteniendoGps}
            onPress={() => void actualizarUbicacionGps()}
          />
          <Button titulo="Continuar" disabled={!tieneUbicacion} onPress={continuar} />
        </ScrollView>
      </PasoAnimado>
    </Fondo>
  );
}