import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { useCameraPermission } from '@/hooks/useCameraPermission';
import { eliminarFoto, persistirFoto } from '@/services/imageStorage';

import { Badge, Button, Card } from './ui';

interface CameraCaptureProps {
  codigoMedidor: string;
  fotoUri: string | null;
  obligatoria: boolean;
  motivoObligatoria: string | null;
  onCambiar: (uri: string | null) => void;
  error?: string;
  /** Foto de la lectura que se corrige: no se borra hasta guardar la corrección. */
  fotoProtegida?: string | null;
}

/** Foto del medidor con la cámara del sistema y manejo del permiso denegado (R7). */
export function CameraCapture({
  codigoMedidor,
  fotoUri,
  obligatoria,
  motivoObligatoria,
  onCambiar,
  error,
  fotoProtegida = null,
}: CameraCaptureProps) {
  const { estado, solicitar, abrirAjustes } = useCameraPermission();
  const [capturando, setCapturando] = useState(false);
  const [errorCaptura, setErrorCaptura] = useState<string | null>(null);

  const tomarFoto = async () => {
    setErrorCaptura(null);
    if (estado !== 'concedido' && !(await solicitar())) return;

    setCapturando(true);
    try {
      const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (resultado.canceled) return;
      const nueva = await persistirFoto(resultado.assets[0].uri, codigoMedidor);
      descartar(fotoUri);
      onCambiar(nueva);
    } catch {
      setErrorCaptura('No se pudo guardar la foto. Inténtalo de nuevo.');
    } finally {
      setCapturando(false);
    }
  };

  const descartar = (uri: string | null) => {
    if (uri !== fotoProtegida) eliminarFoto(uri);
  };

  const quitarFoto = () => {
    descartar(fotoUri);
    onCambiar(null);
  };

  const sinPermiso = estado === 'denegado' || estado === 'bloqueado';

  return (
    <View className="gap-4">
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-epmaps-dark">Foto del medidor</Text>
          <Badge tono={obligatoria ? 'peligro' : 'info'} texto={obligatoria ? 'Obligatoria' : 'Opcional'} />
        </View>
        <Text className="text-sm text-slate-600">
          La foto respalda qué marcaba el medidor el día de la visita, por si el cliente reclama
          por su consumo.
          {motivoObligatoria ? ` En este registro es obligatoria porque ${motivoObligatoria}.` : ''}
        </Text>

        {fotoUri ? (
          <>
            <Image
              source={{ uri: fotoUri }}
              accessibilityLabel="Foto del medidor"
              className="w-full rounded-2xl bg-epmaps-dark/10"
              style={{ aspectRatio: 3 / 4 }}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button titulo="Tomar otra" variante="contorno" cargando={capturando} onPress={tomarFoto} />
              </View>
              {!obligatoria ? (
                <View className="flex-1">
                  <Button titulo="Quitar foto" variante="contorno" onPress={quitarFoto} />
                </View>
              ) : null}
            </View>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: estado === 'cargando' || capturando, busy: capturando }}
            disabled={estado === 'cargando' || capturando}
            onPress={estado === 'bloqueado' ? abrirAjustes : tomarFoto}
            className={`items-center gap-1 rounded-2xl border-2 border-dashed border-epmaps-accent bg-epmaps-accent/10 p-6 active:bg-epmaps-accent/20 ${
              estado === 'cargando' ? 'opacity-40' : ''
            }`}>
            {capturando ? (
              <ActivityIndicator color="#0455BF" />
            ) : (
              <>
                <Text className="text-3xl">📷</Text>
                <Text className="text-base font-bold text-epmaps-primary">
                  {estado === 'bloqueado' ? 'Abrir Ajustes' : 'Tomar fotografía del medidor'}
                </Text>
              </>
            )}
          </Pressable>
        )}

        {errorCaptura ? <Text className="text-sm font-semibold text-red-700">{errorCaptura}</Text> : null}
        {error && !fotoUri ? <Text className="text-sm font-semibold text-red-700">{error}</Text> : null}
      </Card>

      {sinPermiso && !fotoUri ? (
        <Card className="gap-2 border-l-4 border-status-offline">
          <Text className="font-bold text-epmaps-dark">La app no tiene permiso para usar la cámara</Text>
          <Text className="text-sm text-slate-600">
            Se necesita la cámara solo para fotografiar el medidor como respaldo de la lectura. No se
            usa para nada más.
          </Text>
          <Text className="text-sm text-slate-600">
            {estado === 'bloqueado'
              ? 'El permiso quedó bloqueado: actívalo en Ajustes › Permisos › Cámara.'
              : 'Pulsa "Tomar fotografía del medidor" para volver a pedir el permiso.'}
          </Text>
          <Text className="text-sm font-semibold text-epmaps-dark">
            {obligatoria
              ? 'Sin la foto no puedes completar este registro.'
              : 'Como la foto es opcional, puedes continuar sin ella.'}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}
