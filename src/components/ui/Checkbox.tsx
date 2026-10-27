import { Pressable, View } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';

interface CheckboxProps {
  marcado: boolean;
  onCambiar: (marcado: boolean) => void;
  etiqueta: string;
  error?: string;
}

export function Checkbox({ marcado, onCambiar, etiqueta, error }: CheckboxProps) {
  return (
    <View className="gap-1">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marcado }}
        onPress={() => onCambiar(!marcado)}
        className="flex-row items-center gap-3 py-1">
        <View
          className={`h-7 w-7 items-center justify-center rounded-lg border-2 ${
            marcado ? 'border-epmaps-primary bg-epmaps-primary' : error ? 'border-epmaps-danger bg-white' : 'border-slate-300 bg-white'
          }`}>
          {marcado ? <Icon name="checkmark" size={18} color="#FFFFFF" /> : null}
        </View>
        <Text className="flex-1 text-base font-semibold text-slate-800">{etiqueta}</Text>
      </Pressable>
      {error ? <Text className="text-sm font-medium text-epmaps-danger">{error}</Text> : null}
    </View>
  );
}
