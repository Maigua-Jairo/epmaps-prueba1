import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Input } from '@/components/ui';
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
    <KeyboardAvoidingView
      className="flex-1 bg-epmaps-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: top + 48 }} className="items-center px-6 pb-12">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-white/15">
            <View className="h-10 w-10 rotate-45 rounded-bl-full rounded-br-full rounded-tl-full bg-epmaps-secondary" />
          </View>
          <Text className="text-3xl font-extrabold tracking-tight text-white">EPMAPS Lecturas</Text>
          <Text className="mt-1 text-base text-white/80">Registro de medidores en campo</Text>
        </View>

        <View className="flex-1 gap-5 rounded-t-[32px] bg-white px-6 pb-10 pt-8">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Inicia tu jornada</Text>
            <Text className="mt-1 text-sm text-slate-500">
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
            <View className="rounded-2xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-medium text-epmaps-danger">{error}</Text>
            </View>
          ) : null}

          <Button titulo="Ingresar" disabled={!completo} cargando={enviando} onPress={ingresar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
