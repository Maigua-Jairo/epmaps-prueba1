import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, View } from 'react-native';

import { useCameraPermission } from '@/hooks/useCameraPermission';
import { eliminarFoto, persistirFoto } from '@/services/imageStorage';

import { Badge, Button, Card, Icon, Text } from './ui';

interface CameraCaptureProps {
  codigoMedidor: string;
  fotoUri: string | null;
  obligatoria: boolean;
  /** Por qué es obligatoria, para explicárselo al técnico. */
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
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-epmaps-sky">
              <Icon name="camera-outline" size={22} color="#0067B1" />
            </View>
            <Text className="text-lg font-extrabold text-slate-900">Foto del medidor</Text>
          </View>
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
              className="w-full rounded-2xl bg-slate-200"
              style={{ aspectRatio: 3 / 4 }}
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  titulo="Tomar otra"
                  icono="camera-reverse-outline"
                  variante="secundario"
                  cargando={capturando}
                  onPress={tomarFoto}
                />
              </View>
              {!obligatoria ? (
                <View className="flex-1">
                  <Button titulo="Quitar" icono="trash-outline" variante="secundario" onPress={quitarFoto} />
                </View>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <View
              className={`items-center gap-2 rounded-2xl border-2 border-dashed py-8 ${
                error ? 'border-red-300 bg-red-50/50' : 'border-slate-200 bg-slate-50'
              }`}>
              <Icon
                name={sinPermiso ? 'videocam-off-outline' : 'scan-outline'}
                size={40}
                color={error ? '#F87171' : '#94A3B8'}
              />
              <Text className="text-sm font-semibold text-slate-400">
                {sinPermiso ? 'Cámara sin permiso' : 'Encuadra el numerador del medidor'}
              </Text>
            </View>
            <Button
              titulo={estado === 'bloqueado' ? 'Abrir Ajustes' : 'Tomar foto'}
              icono={estado === 'bloqueado' ? 'settings-outline' : 'camera'}
              cargando={capturando}
              disabled={estado === 'cargando'}
              onPress={estado === 'bloqueado' ? abrirAjustes : tomarFoto}
            />
          </>
        )}

        {errorCaptura ? <Text className="text-sm font-semibold text-epmaps-danger">{errorCaptura}</Text> : null}
        {error && !fotoUri ? <Text className="text-sm font-semibold text-epmaps-danger">{error}</Text> : null}
      </Card>

      {sinPermiso && !fotoUri ? (
        <Card className="gap-2 border-l-4 border-amber-500">
          <View className="flex-row items-center gap-2">
            <Icon name="information-circle" size={20} color="#D97706" />
            <Text className="flex-1 font-extrabold text-slate-900">
              La app no tiene permiso para usar la cámara
            </Text>
          </View>
          <Text className="text-sm text-slate-600">
            Se necesita la cámara solo para fotografiar el medidor como respaldo de la lectura. No se
            usa para nada más.
          </Text>
          <Text className="text-sm text-slate-600">
            {estado === 'bloqueado'
              ? 'El permiso quedó bloqueado: actívalo en Ajustes › Permisos › Cámara.'
              : 'Pulsa "Tomar foto" para volver a pedir el permiso.'}
          </Text>
          <Text className="text-sm font-semibold text-slate-800">
            {obligatoria
              ? 'Sin la foto no puedes completar este registro.'
              : 'Como la foto es opcional, puedes continuar sin ella.'}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}
