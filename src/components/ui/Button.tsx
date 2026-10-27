import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Variante = 'primario' | 'secundario' | 'peligro' | 'claro';

const estilos: Record<Variante, { boton: string; texto: string; color: string }> = {
  primario: { boton: 'bg-epmaps-primary', texto: 'text-white', color: '#FFFFFF' },
  secundario: {
    boton: 'border-2 border-epmaps-primary/30 bg-epmaps-sky',
    texto: 'text-epmaps-primary',
    color: '#0067B1',
  },
  peligro: { boton: 'bg-epmaps-danger', texto: 'text-white', color: '#FFFFFF' },
  /** Sobre fondos azules. */
  claro: { boton: 'bg-white', texto: 'text-epmaps-primary', color: '#0067B1' },
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  titulo: string;
  variante?: Variante;
  cargando?: boolean;
  icono?: IconName;
}

export function Button({
  titulo,
  variante = 'primario',
  cargando,
  disabled,
  icono,
  ...rest
}: ButtonProps) {
  const estilo = estilos[variante];
  const inactivo = disabled || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      disabled={inactivo}
      className={`h-14 flex-row items-center justify-center rounded-2xl px-5 active:opacity-80 ${estilo.boton} ${disabled ? 'opacity-40' : ''}`}
      {...rest}>
      {cargando ? (
        <ActivityIndicator color={estilo.color} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icono ? <Icon name={icono} size={20} color={estilo.color} /> : null}
          <Text className={`text-base font-bold ${estilo.texto}`}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}
