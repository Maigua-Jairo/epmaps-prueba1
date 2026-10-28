import { Pressable, Text, View } from 'react-native';

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
            marcado ? 'border-epmaps-primary bg-epmaps-primary' : error ? 'border-status-danger bg-white' : 'border-epmaps-dark/20 bg-white'
          }`}>
          {marcado ? <Text className="text-base font-bold text-white">✓</Text> : null}
        </View>
        <Text className="flex-1 text-base font-semibold text-epmaps-dark">{etiqueta}</Text>
      </Pressable>
      {error ? <Text className="text-sm font-semibold text-red-700">{error}</Text> : null}
    </View>
  );
}
