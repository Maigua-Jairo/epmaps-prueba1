import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { getPasswordStrength } from '@/domain/passwordStrength';
import { useSesion } from '@/context/sesion';
import { mensajeDeError } from '@/lib/errores-firebase';

export default function RegistroScreen() {
  const { top } = useSafeAreaInsets();
  const { registrarse } = useSesion();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState(false);
  const [registroEnviado, setRegistroEnviado] = useState(false);
  const fortaleza = getPasswordStrength(clave);

  const crearCuenta = async () => {
    setError(null);
    setRegistrando(true);
    try {
      await registrarse(nombre, correo, clave);
      setRegistroEnviado(true);
    } catch (errorRegistro) {
      setError(mensajeDeError(errorRegistro));
    } finally {
      setRegistrando(false);
    }
  };

  const colorFortaleza =
    fortaleza === 'fuerte' ? 'text-green-700' : fortaleza === 'media' ? 'text-amber-700' : 'text-red-700';
  const colorBarra =
    fortaleza === 'fuerte'
      ? 'bg-green-600'
      : fortaleza === 'media'
        ? 'bg-amber-500'
        : 'bg-red-600';

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
            <Text className="text-3xl font-extrabold text-white">Crear cuenta</Text>
            <Text className="mt-2 text-base text-white/80">Registra tu correo para acceder a EPMAPS Lecturas.</Text>
          </View>

          <Card className="-mt-6 mx-4 mb-10 gap-5 p-6">
            {registroEnviado ? (
              <View className="gap-4">
                <View className="rounded-2xl bg-green-50 px-4 py-4">
                  <Text className="font-bold text-green-800">Cuenta creada</Text>
                  <Text className="mt-1 text-sm leading-5 text-green-800">
                    Enviamos un enlace de verificación a {correo.trim()}. Confirma tu correo y luego inicia sesión.
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
                  etiqueta="Nombre"
                  placeholder="Nombre y apellido"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  value={nombre}
                  onChangeText={setNombre}
                  returnKeyType="next"
                />
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
                <View className="gap-2">
                  <Input
                    etiqueta="Contraseña"
                    placeholder="Crea una contraseña"
                    secureTextEntry={!mostrarClave}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    value={clave}
                    onChangeText={setClave}
                    returnKeyType="done"
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
                  {fortaleza ? (
                    <View accessibilityLiveRegion="polite" className="gap-1">
                      <View className="flex-row gap-1">
                        {[0, 1, 2].map((segmento) => (
                          <View
                            key={segmento}
                            className={`h-1.5 flex-1 rounded-full ${segmento === 0 || (segmento === 1 && fortaleza !== 'débil') || (segmento === 2 && fortaleza === 'fuerte') ? colorBarra : 'bg-slate-200'}`}
                          />
                        ))}
                      </View>
                      <Text className={`text-xs font-semibold ${colorFortaleza}`}>
                        Seguridad de la contraseña: {fortaleza}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {error ? (
                  <View accessibilityLiveRegion="polite" className="rounded-2xl bg-status-danger/10 px-4 py-3">
                    <Text className="text-sm font-semibold text-red-700">{error}</Text>
                  </View>
                ) : null}

                <Button
                  titulo="Crear cuenta"
                  disabled={!nombre.trim() || !correo.trim() || !clave}
                  cargando={registrando}
                  onPress={crearCuenta}
                />
                <View className="flex-row items-center justify-center gap-1">
                  <Text className="text-sm text-slate-600">¿Ya tienes cuenta?</Text>
                  <Link href="/login" asChild>
                    <Pressable accessibilityRole="link" hitSlop={8}>
                      <Text className="font-bold text-epmaps-primary">Inicia sesión</Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}
