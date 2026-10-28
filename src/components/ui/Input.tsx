import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  etiqueta: string;
  error?: string | null;
}

export function Input({ etiqueta, error, onFocus, onBlur, ...rest }: InputProps) {
  const [enfocado, setEnfocado] = useState(false);
  const borde = error
    ? 'border-epmaps-danger'
    : enfocado
      ? 'border-epmaps-primary'
      : 'border-slate-200';

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor="#94A3B8"
        textAlignVertical={rest.multiline ? 'top' : 'center'}
        className={`rounded-2xl border-2 bg-slate-50 px-4 text-base text-slate-900 ${rest.multiline ? 'min-h-28 py-3' : 'h-14'} ${borde}`}
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
      {error ? <Text className="text-sm font-medium text-epmaps-danger">{error}</Text> : null}
    </View>
  );
}
