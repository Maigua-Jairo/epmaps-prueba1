import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Fondo, Input, ReflejosCabecera } from '@/components/ui';
import { useSession } from '@/hooks/useSession';

/** Identificación del técnico al iniciar la jornada (R1). */
export default function LoginScreen() {
  const { top } = useSafeAreaInsets();
  const { iniciarSesion } = useSession();
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const completo = codigo.trim() !== '' && clave !== '';

  const ingresar = async () => {
    setError(null);
    setEnviando(true);
    const ok = await iniciarSesion(codigo, clave);
    // Si es correcto, Stack.Protected cambia de pantalla; aquí solo queda el caso de error.
    if (!ok) {
      setError('Código de empleado o clave incorrectos');
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

          <Card className="-mt-8 mx-4 mb-10 gap-5 p-6">
            <View>
              <Text className="text-2xl font-bold text-epmaps-dark">Inicia tu jornada</Text>
              <Text className="mt-1 text-sm text-slate-600">
                Ingresa con tu código de empleado. Tu sesión se mantiene hasta que la cierres.
              </Text>
            </View>

            <Input
              etiqueta="Código de empleado"
              placeholder="EMP-001"
              autoCapitalize="characters"
              autoCorrect={false}
              value={codigo}
              onChangeText={setCodigo}
              returnKeyType="next"
            />
            <Input
              etiqueta="Clave"
              placeholder="••••••••"
              secureTextEntry
              value={clave}
              onChangeText={setClave}
              returnKeyType="go"
              onSubmitEditing={() => completo && ingresar()}
            />

            {error ? (
              <View className="rounded-2xl bg-status-danger/10 px-4 py-3">
                <Text className="text-sm font-semibold text-red-700">{error}</Text>
              </View>
            ) : null}

            <Button titulo="Ingresar" disabled={!completo} cargando={enviando} onPress={ingresar} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fondo>
  );
}
