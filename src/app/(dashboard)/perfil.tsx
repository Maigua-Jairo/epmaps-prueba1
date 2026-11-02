import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { useSesion } from '@/context/sesion';
import { mensajeDeError } from '@/lib/errores-firebase';

export default function PerfilScreen() {
  const { top } = useSafeAreaInsets();
  const { sesion, correo } = useSession();
  const { actualizarNombre } = useSesion();
  const [nombre, setNombre] = useState(sesion?.tecnico.nombre ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setError(null);
    setGuardado(false);
    setGuardando(true);
    try {
      await actualizarNombre(nombre);
      setNombre(nombre.trim());
      setGuardado(true);
    } catch (errorActualizacion) {
      setError(mensajeDeError(errorActualizacion));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Fondo>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          <View
            style={{ paddingTop: top + 16 }}
            className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-5 pb-8">
            <ReflejosCabecera />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 active:bg-white/25">
              <Text className="text-xl font-bold text-white">‹</Text>
            </Pressable>
            <Text className="mt-4 text-2xl font-extrabold text-white">Mi perfil</Text>
            <Text className="text-sm text-white/70">Actualiza el nombre que aparece en tu cuenta.</Text>
          </View>

          <Card className="-mt-5 mx-4 mb-10 gap-5 p-6">
            <View className="gap-1">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Correo electrónico
              </Text>
              <Text className="text-base font-semibold text-epmaps-dark">{correo}</Text>
            </View>

            <Input
              etiqueta="Nombre"
              placeholder="Nombre y apellido"
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              value={nombre}
              onChangeText={(valor) => {
                setNombre(valor);
                setGuardado(false);
              }}
              returnKeyType="done"
              onSubmitEditing={guardar}
            />

            {error ? (
              <View accessibilityLiveRegion="polite" className="rounded-2xl bg-status-danger/10 px-4 py-3">
                <Text className="text-sm font-semibold text-red-700">{error}</Text>
              </View>
            ) : null}
            {guardado ? (
              <View accessibilityLiveRegion="polite" className="rounded-2xl bg-green-50 px-4 py-3">
                <Text className="text-sm font-semibold text-green-800">Nombre actualizado correctamente.</Text>
              </View>
            ) : null}

            <Button
              titulo="Guardar cambios"
              disabled={!nombre.trim() || nombre.trim() === sesion?.tecnico.nombre}
              cargando={guardando}
              onPress={guardar}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}
