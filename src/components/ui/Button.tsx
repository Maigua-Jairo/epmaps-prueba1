import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variante = 'primario' | 'secundario' | 'peligro';

const estilos: Record<Variante, { boton: string; texto: string; spinner: string }> = {
  primario: { boton: 'bg-epmaps-primary', texto: 'text-white', spinner: '#FFFFFF' },
  secundario: {
    boton: 'border-2 border-epmaps-primary bg-white',
    texto: 'text-epmaps-primary',
    spinner: '#0067B1',
  },
  peligro: { boton: 'bg-epmaps-danger', texto: 'text-white', spinner: '#FFFFFF' },
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  titulo: string;
  variante?: Variante;
  cargando?: boolean;
}

export function Button({ titulo, variante = 'primario', cargando, disabled, ...rest }: ButtonProps) {
  const estilo = estilos[variante];
  const inactivo = disabled || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      disabled={inactivo}
      className={`h-14 items-center justify-center rounded-2xl px-5 active:opacity-80 ${estilo.boton} ${disabled ? 'opacity-40' : ''}`}
      {...rest}>
      {cargando ? (
        <ActivityIndicator color={estilo.spinner} />
      ) : (
        <Text className={`text-base font-bold tracking-wide ${estilo.texto}`}>{titulo}</Text>
      )}
    </Pressable>
  );
}
