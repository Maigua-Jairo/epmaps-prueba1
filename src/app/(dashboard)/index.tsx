import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MedidorCard } from '@/components/MedidorCard';
import { Button, Card, Input } from '@/components/ui';
import { esCodigoMedidorValido, LONGITUD_CODIGO_MEDIDOR } from '@/domain/medidor.rules';
import { useMedidorSearch } from '@/hooks/useMedidorSearch';
import { useSession } from '@/hooks/useSession';

/** Identificación y consulta del medidor (R2, R3). */
export default function InicioScreen() {
  const { top } = useSafeAreaInsets();
  const { sesion, cerrarSesion } = useSession();
  const { medidor, origen, cargando, error, buscar, limpiar } = useMedidorSearch();
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

  const cambiarCodigo = (texto: string) => {
    setCodigo(texto.toUpperCase());
    setErrorCodigo(null);
    limpiar();
  };

  // R2: con un código incompleto o mal formado no se consulta ni se muestra ningún medidor.
  const consultar = () => {
    const limpio = codigo.trim();
    if (!esCodigoMedidorValido(limpio)) {
      limpiar();
      setErrorCodigo('El código debe ser MED- seguido de 6 dígitos. Ejemplo: MED-100001');
      return;
    }
    buscar(limpio);
  };

  const confirmarCierre = () => {
    Alert.alert('Cerrar sesión', 'Deberás ingresar tu código y clave nuevamente.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-100">
      <View style={{ paddingTop: top + 16 }} className="rounded-b-[32px] bg-epmaps-primary px-6 pb-14">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-white/70">Técnico en jornada</Text>
            <Text className="text-2xl font-bold text-white">{sesion?.tecnico.nombre}</Text>
            <Text className="text-sm font-medium text-white/70">{sesion?.tecnico.codigo}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={confirmarCierre}
            className="rounded-full bg-white/15 px-4 py-2 active:bg-white/25">
            <Text className="text-sm font-semibold text-white">Salir</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="-mt-8 flex-1"
        contentContainerClassName="gap-4 px-4 pb-10"
        keyboardShouldPersistTaps="handled">
        <Card className="gap-4">
          <View>
            <Text className="text-lg font-bold text-slate-900">Consultar medidor</Text>
            <Text className="text-sm text-slate-500">Escribe el código de la etiqueta del medidor.</Text>
          </View>
          <Input
            etiqueta="Código del medidor"
            placeholder="MED-000000"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={LONGITUD_CODIGO_MEDIDOR}
            returnKeyType="search"
            value={codigo}
            onChangeText={cambiarCodigo}
            onSubmitEditing={consultar}
            error={errorCodigo}
          />
          <Button titulo="Consultar" cargando={cargando} onPress={consultar} />
        </Card>

        {cargando ? (
          <View className="items-center py-6">
            <ActivityIndicator size="large" color="#0067B1" />
          </View>
        ) : null}

        {error ? (
          <Card className="border-l-4 border-epmaps-danger">
            <Text className="font-semibold text-slate-900">No se pudo mostrar el medidor</Text>
            <Text className="mt-1 text-sm text-slate-600">{error}</Text>
          </Card>
        ) : null}

        {medidor && origen ? <MedidorCard medidor={medidor} origen={origen} /> : null}
      </ScrollView>
    </View>
  );
}
