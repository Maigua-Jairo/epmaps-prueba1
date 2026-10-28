import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { ScrollView } from 'react-native';

import { CameraCapture } from '@/components/CameraCapture';
import { RegistroHeader } from '@/components/RegistroHeader';
import { Button, Fondo } from '@/components/ui';
import { useRegistro } from '@/hooks/useLecturaForm';

/** Paso 3: foto del medidor, obligatoria u opcional según R7. */
export default function FotoScreen() {
  const { codigo, original, form, calculo, marcarPaso } = useRegistro();
  useFocusEffect(useCallback(() => marcarPaso('foto'), [marcarPaso]));
  // useWatch se suscribe al campo: el botón se actualiza al tomar o quitar la foto.
  const estado = useWatch({ control: form.control, name: 'estado' });
  const fotoUri = useWatch({ control: form.control, name: 'fotoUri' });

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
    <Fondo>
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
              fotoProtegida={original?.fotoUri}
            />
          )}
        />
        <Button
          titulo={!fotoUri && !calculo.fotoObligatoria ? 'Continuar sin foto' : 'Continuar'}
          disabled={!fotoUri && calculo.fotoObligatoria}
          onPress={continuar}
        />
      </ScrollView>
    </Fondo>
  );
}
