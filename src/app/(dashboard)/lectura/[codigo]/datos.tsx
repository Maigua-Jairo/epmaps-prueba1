import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { RegistroHeader } from '@/components/RegistroHeader';
import { Button, Card, Checkbox, Input } from '@/components/ui';
import { FACTOR_ANOMALIA } from '@/domain/medidor.rules';
import { useRegistro } from '@/hooks/useLecturaForm';

/** Paso 2: lectura, motivo o descripción según el estado (R5) y control de consumo (R6). */
export default function DatosScreen() {
  const { codigo, medidor, form, calculo, marcarPaso } = useRegistro();
  useFocusEffect(useCallback(() => marcarPaso('datos'), [marcarPaso]));
  const estado = form.watch('estado');
  const pideLectura = estado !== 'INACCESIBLE';

  const continuar = async () => {
    // Solo los campos de este paso; la foto se valida en el siguiente.
    if (await form.trigger(['lectura', 'motivo', 'descripcion', 'revisionConfirmada'])) {
      router.push({ pathname: '/lectura/[codigo]/foto', params: { codigo } });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-100"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <RegistroHeader paso={2} titulo="Datos de la lectura" />
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
        {!medidor ? (
          <Card className="border-l-4 border-amber-500">
            <Text className="font-bold text-slate-900">Sin datos del medidor</Text>
            <Text className="mt-1 text-sm text-slate-600">
              No hay señal y este medidor no se consultó antes. La lectura se guardará como pendiente
              de verificar y el consumo se calculará al recuperar la conexión.
            </Text>
          </Card>
        ) : null}

        <Card className="gap-4">
          {pideLectura ? (
            <>
              {medidor ? (
                <View className="flex-row justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <Text className="text-sm text-slate-500">Lectura anterior</Text>
                  <Text className="text-sm font-bold text-slate-900">{medidor.ultimaLectura} m³</Text>
                </View>
              ) : null}
              <Controller
                control={form.control}
                name="lectura"
                render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                  <Input
                    etiqueta={estado === 'DANADO' ? 'Lectura actual (opcional)' : 'Lectura actual (m³)'}
                    placeholder="0"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={(t) => {
                      onChange(t.replace(/\D/g, ''));
                      // Una lectura distinta exige volver a confirmar la revisión (R6).
                      form.setValue('revisionConfirmada', false);
                    }}
                    onBlur={onBlur}
                    error={error?.message}
                  />
                )}
              />
            </>
          ) : null}

          {estado === 'INACCESIBLE' ? (
            <Controller
              control={form.control}
              name="motivo"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <Input
                  etiqueta="Motivo por el que es inaccesible"
                  placeholder="Ej. Perro suelto, caja bajo vehículo estacionado…"
                  multiline
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />
          ) : null}

          {estado === 'DANADO' ? (
            <Controller
              control={form.control}
              name="descripcion"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <Input
                  etiqueta="Descripción del daño"
                  placeholder="Ej. Vidrio roto, numerador empañado…"
                  multiline
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />
          ) : null}
        </Card>

        {pideLectura && calculo.consumo !== null && calculo.consumo >= 0 ? (
          <Card className={`gap-3 ${calculo.esAnomalo ? 'border-2 border-amber-400' : ''}`}>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Consumo del mes</Text>
                <Text
                  className={`text-3xl font-extrabold ${calculo.esAnomalo ? 'text-amber-600' : 'text-slate-900'}`}>
                  {calculo.consumo} <Text className="text-base font-semibold text-slate-500">m³</Text>
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Promedio mensual</Text>
                <Text className="text-3xl font-extrabold text-slate-900">
                  {medidor?.consumoPromedio} <Text className="text-base font-semibold text-slate-500">m³</Text>
                </Text>
              </View>
            </View>

            {calculo.esAnomalo ? (
              <View className="gap-3 rounded-2xl bg-amber-50 p-4">
                <Text className="font-bold text-amber-900">⚠ Consumo anómalo</Text>
                <Text className="text-sm text-amber-900">
                  Supera {FACTOR_ANOMALIA} veces el promedio mensual. Revisa el medidor y confirma
                  que la lectura es correcta. La foto del medidor será obligatoria.
                </Text>
                <Controller
                  control={form.control}
                  name="revisionConfirmada"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <Checkbox
                      marcado={value}
                      onCambiar={onChange}
                      etiqueta="Revisé el medidor y la lectura es correcta"
                      error={error?.message}
                    />
                  )}
                />
              </View>
            ) : null}
          </Card>
        ) : null}

        <Button titulo="Continuar" onPress={continuar} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
