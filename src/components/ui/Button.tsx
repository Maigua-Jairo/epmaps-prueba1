import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variante = 'primario' | 'secundario' | 'contorno' | 'peligro';

const estilos: Record<Variante, { boton: string; texto: string; spinner: string }> = {
  primario: { boton: 'bg-epmaps-primary', texto: 'text-white', spinner: '#FFFFFF' },
  secundario: { boton: 'bg-epmaps-secondary', texto: 'text-white', spinner: '#FFFFFF' },
  contorno: {
    boton: 'border-2 border-epmaps-primary/40 bg-white/60',
    texto: 'text-epmaps-primary',
    spinner: '#0455BF',
  },
  peligro: { boton: 'bg-status-danger', texto: 'text-white', spinner: '#FFFFFF' },
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  titulo: string;
  variante?: Variante;
  cargando?: boolean;
}

/** Botón institucional; 56 px de alto, por encima del mínimo táctil de 44 px. */
export function Button({ titulo, variante = 'primario', cargando, disabled, ...rest }: ButtonProps) {
  const estilo = estilos[variante];
  const inactivo = disabled || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      disabled={inactivo}
      className={`h-14 items-center justify-center rounded-2xl px-5 active:opacity-90 ${estilo.boton} ${disabled ? 'opacity-40' : ''}`}
      {...rest}>
      {cargando ? (
        <ActivityIndicator color={estilo.spinner} />
      ) : (
        <Text className={`text-base font-bold tracking-wide ${estilo.texto}`}>{titulo}</Text>
      )}
    </Pressable>
  );
}
