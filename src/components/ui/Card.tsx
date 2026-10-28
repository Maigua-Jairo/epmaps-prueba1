import { View, type ViewProps } from 'react-native';

/** Tarjeta de vidrio: blanco translúcido con borde claro sobre el Fondo. */
export function Card({ className, ...rest }: ViewProps) {
  return (
    <View
      className={`rounded-3xl border border-white bg-white/75 p-5 ${className ?? ''}`}
      {...rest}
    />
  );
}
