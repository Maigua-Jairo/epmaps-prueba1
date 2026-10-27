import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { CameraCapture } from '@/components/CameraCapture';
import { RegistroHeader } from '@/components/RegistroHeader';
import { Button } from '@/components/ui';
import { useRegistro } from '@/hooks/useLecturaForm';

/** Paso 3: foto del medidor, obligatoria u opcional según R7. */
export default function FotoScreen() {
  const { codigo, form, calculo } = useRegistro();
  const estado = form.watch('estado');
  const fotoUri = form.watch('fotoUri');

  const motivo =
    estado === 'DANADO'
      ? 'el medidor está dañado'
      : calculo.esAnomalo
        ? 'el consumo supera el triple del promedio'
        : null;

  const continuar = async () => {
    if (await form.trigger('fotoUri')) {
      router.push({ pathname: '/lectura/[codigo]/resumen', params: { codigo } });
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <RegistroHeader paso={3} titulo="Foto de respaldo" />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <Controller
          control={form.control}
          name="fotoUri"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <CameraCapture
              codigoMedidor={codigo}
              fotoUri={value}
              obligatoria={calculo.fotoObligatoria}
              motivoObligatoria={motivo}
              onCambiar={(uri) => {
                onChange(uri);
                if (uri) form.clearErrors('fotoUri');
              }}
              error={error?.message}
            />
          )}
        />
        <Button
          titulo={!fotoUri && !calculo.fotoObligatoria ? 'Continuar sin foto' : 'Continuar'}
          disabled={!fotoUri && calculo.fotoObligatoria}
          onPress={continuar}
        />
      </ScrollView>
    </View>
  );
}
