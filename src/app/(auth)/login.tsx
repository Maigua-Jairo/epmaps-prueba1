import { useState } from 'react';
import { Link } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSession } from '@/hooks/useSession';
import { mensajeDeError } from '@/lib/errores-firebase';

/** Acceso a la jornada con una cuenta Firebase verificada. */
export default function LoginScreen() {
  const { top } = useSafeAreaInsets();
  const { iniciarSesion } = useSession();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const shake = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const completo = correo.trim() !== '' && clave !== '';

  const dispararShake = () => {
    // Reanimated exige mutar el shared value desde la lógica del gesto.
    // eslint-disable-next-line react-hooks/immutability
    shake.value = withSequence(
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-8, { duration: 40 }),
      withTiming(8, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
  };

  const ingresar = async () => {
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(correo, clave);
    } catch (errorInicio) {
      setError(mensajeDeError(errorInicio));
      dispararShake();
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
            style={{ paddingTop: top + 40 }}
            className="items-center overflow-hidden rounded-b-[40px] bg-epmaps-dark px-6 pb-16">
            <ReflejosCabecera />
            <Image
              source={require('@/assets/images/icon.png')}
              accessibilityLabel="Logo de EPMAPS"
              className="mb-5 h-24 w-24 rounded-3xl border-2 border-white/30"
            />
            <Text className="text-3xl font-extrabold tracking-tight text-white">EPMAPS Lecturas</Text>
            <Text className="mt-1 text-base text-white/80">Registro de medidores en campo</Text>
          </View>

          <Animated.View style={animatedStyle}>
            <Card className="-mt-8 mx-4 mb-10 gap-5 p-6">
              <View>
                <Text className="text-2xl font-bold text-epmaps-dark">Inicia tu jornada</Text>
                <Text className="mt-1 text-sm text-slate-600">
                  Ingresa con el correo asociado a tu cuenta. Debes verificarlo antes de continuar.
                </Text>
              </View>

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
                returnKeyType="next"
              />
              <Input
                etiqueta="Clave"
                placeholder="••••••••"
                secureTextEntry={!mostrarClave}
                value={clave}
                onChangeText={setClave}
                returnKeyType="go"
                onSubmitEditing={() => completo && ingresar()}
                trailing={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onPress={() => setMostrarClave((visible) => !visible)}
                    hitSlop={8}>
                    <Text className="text-xs font-bold text-epmaps-primary">
                      {mostrarClave ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </Pressable>
                }
              />

              {error ? (
                <View className="rounded-2xl bg-status-danger/10 px-4 py-3">
                  <Text className="text-sm font-semibold text-red-700">{error}</Text>
                </View>
              ) : null}
                <View className="flex-row items-right gap-1">
                <Text className="text-xs text-slate-600">¿Olvidaste tu contraseña?</Text>
                <Link href="/recuperar" asChild>
                  <Pressable accessibilityRole="link" hitSlop={8}>
                    <Text className="text-xs font-semibold text-epmaps-primary" >Recuperar Contraseña</Text>
                  </Pressable>
                </Link>
                </View>


              <Button titulo="Ingresar" disabled={!completo} cargando={enviando} onPress={ingresar} />

              <View className="items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm text-slate-600">¿No tienes cuenta?</Text>
                  <Link href="/registro" asChild>
                    <Pressable accessibilityRole="link" hitSlop={8}>
                      <Text className="font-bold text-epmaps-primary">Crear cuenta</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}
