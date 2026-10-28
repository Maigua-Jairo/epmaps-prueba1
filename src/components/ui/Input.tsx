import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  etiqueta: string;
  error?: string | null;
}

export function Input({ etiqueta, error, onFocus, onBlur, ...rest }: InputProps) {
  const [enfocado, setEnfocado] = useState(false);
  const borde = error
    ? 'border-status-danger'
    : enfocado
      ? 'border-epmaps-primary'
      : 'border-epmaps-dark/10';

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor="#94A3B8"
        textAlignVertical={rest.multiline ? 'top' : 'center'}
        className={`rounded-2xl border-2 bg-white/80 px-4 text-base text-epmaps-dark ${rest.multiline ? 'min-h-28 py-3' : 'h-14'} ${borde}`}
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
      {error ? <Text className="text-sm font-semibold text-red-700">{error}</Text> : null}
    </View>
  );
}
