import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSesion } from '@/context/sesion';
import { mensajeDeError } from '@/lib/errores-firebase';

export default function RecuperarScreen() {
  const { top } = useSafeAreaInsets();
  const { enviarCorreoRecuperacion } = useSesion();
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviarEnlace = async () => {
    setError(null);
    setEnviando(true);
    try {
      await enviarCorreoRecuperacion(correo);
      setEnviado(true);
    } catch (errorEnvio) {
      setError(mensajeDeError(errorEnvio));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Fondo>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
          <View
            style={{ paddingTop: top + 32 }}
            className="overflow-hidden rounded-b-[32px] bg-epmaps-dark px-6 pb-12">
            <ReflejosCabecera />
            <Text className="text-3xl font-extrabold text-white">Actualizar contraseña</Text>
            <Text className="mt-2 text-base text-white/80">Te enviaremos un enlace al correo de tu cuenta.</Text>
          </View>

          <Card className="-mt-6 mx-4 mb-10 gap-5 p-6">
            {enviado ? (
              <View className="gap-4">
                <View className="rounded-2xl bg-green-50 px-4 py-4">
                  <Text className="text-sm leading-5 text-green-800">
                    Si existe una cuenta asociada a {correo.trim()}, recibirás un correo con los pasos para
                    actualizar la contraseña.
                  </Text>
                </View>
                <Link href="/login" asChild>
                  <Pressable accessibilityRole="link" className="items-center py-3">
                    <Text className="font-bold text-epmaps-primary">Volver a iniciar sesión</Text>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <>
                <Input
                  etiqueta="Correo electrónico"
                  placeholder="nombre@dominio.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={correo}
                  onChangeText={setCorreo}
                  returnKeyType="send"
                  onSubmitEditing={() => correo.trim() && enviarEnlace()}
                />
                {error ? (
                  <View accessibilityLiveRegion="polite" className="rounded-2xl bg-status-danger/10 px-4 py-3">
                    <Text className="text-sm font-semibold text-red-700">{error}</Text>
                  </View>
                ) : null}
                <Button
                  titulo="Enviar enlace"
                  disabled={!correo.trim()}
                  cargando={enviando}
                  onPress={enviarEnlace}
                />
                <Link href="/login" asChild>
                  <Pressable accessibilityRole="link" className="items-center py-2">
                    <Text className="font-semibold text-epmaps-primary">Volver al inicio de sesión</Text>
                  </Pressable>
                </Link>
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}
