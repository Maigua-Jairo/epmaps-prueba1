import { useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  etiqueta: string;
  error?: string | null;
  icono?: IconName;
  /** Elemento a la derecha del campo (p. ej. mostrar/ocultar clave). */
  accesorio?: ReactNode;
}

export function Input({ etiqueta, error, icono, accesorio, onFocus, onBlur, ...rest }: InputProps) {
  const [enfocado, setEnfocado] = useState(false);
  const borde = error
    ? 'border-epmaps-danger bg-red-50/40'
    : enfocado
      ? 'border-epmaps-primary bg-white'
      : 'border-slate-200 bg-slate-50';
  const colorIcono = error ? '#D32F2F' : enfocado ? '#0067B1' : '#94A3B8';

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">{etiqueta}</Text>
      <View
        className={`flex-row rounded-2xl border-2 px-4 ${rest.multiline ? 'min-h-28 items-start py-3' : 'h-14 items-center'} ${borde}`}>
        {icono ? (
          <View className={`mr-3 ${rest.multiline ? 'pt-0.5' : ''}`}>
            <Icon name={icono} size={20} color={colorIcono} />
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={etiqueta}
          placeholderTextColor="#94A3B8"
          textAlignVertical={rest.multiline ? 'top' : 'center'}
          className={`flex-1 font-semibold text-base text-slate-900 ${rest.multiline ? 'min-h-20' : 'h-full'}`}
          onFocus={(e) => {
            setEnfocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {accesorio}
      </View>
      {error ? (
        <View className="flex-row items-center gap-1.5">
          <Icon name="alert-circle" size={16} color="#D32F2F" />
          <Text className="flex-1 text-sm font-semibold text-epmaps-danger">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
