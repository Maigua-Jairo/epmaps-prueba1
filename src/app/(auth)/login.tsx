import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FondoAgua } from '@/components/Cabecera';
import { Button, Icon, Input, Text } from '@/components/ui';
import { useSession } from '@/hooks/useSession';

/** Identificación del técnico al iniciar la jornada (R1). */
export default function LoginScreen() {
  const { top } = useSafeAreaInsets();
  const { iniciarSesion } = useSession();
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
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
        <View style={{ paddingTop: top + 32 }} className="items-center overflow-hidden px-6 pb-14">
          <FondoAgua />
          <View className="mb-5 rounded-[28px] bg-white p-4">
            <Image
              source={require('../../../assets/images/logo-epmaps.png')}
              accessibilityLabel="Logo de EPMAPS"
              style={{ width: 128, height: 128 * (746 / 648) }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-[30px] font-extrabold text-white">Lecturas de medidores</Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-epmaps-secondary" />
            <Text className="text-sm font-semibold tracking-wide text-white/80">
              Agua potable de Quito
            </Text>
          </View>
        </View>

        <View className="-mt-6 flex-1 gap-5 rounded-t-[32px] bg-white px-6 pb-10 pt-8">
          <View>
            <Text className="text-2xl font-extrabold text-slate-900">Inicia tu jornada</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Ingresa con tu código de empleado. Tu sesión se mantiene hasta que la cierres.
            </Text>
          </View>

          <Input
            etiqueta="Código de empleado"
            icono="id-card-outline"
            placeholder="EMP-001"
            autoCapitalize="characters"
            autoCorrect={false}
            value={codigo}
            onChangeText={setCodigo}
            returnKeyType="next"
          />
          <Input
            etiqueta="Clave"
            icono="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry={!verClave}
            value={clave}
            onChangeText={setClave}
            returnKeyType="go"
            onSubmitEditing={() => completo && ingresar()}
            accesorio={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                onPress={() => setVerClave(!verClave)}
                hitSlop={12}>
                <Icon name={verClave ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
              </Pressable>
            }
          />

          {error ? (
            <View className="flex-row items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
              <Icon name="alert-circle" size={20} color="#D32F2F" />
              <Text className="flex-1 text-sm font-semibold text-epmaps-danger">{error}</Text>
            </View>
          ) : null}

          <Button
            titulo="Ingresar"
            icono="arrow-forward"
            disabled={!completo}
            cargando={enviando}
            onPress={ingresar}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
