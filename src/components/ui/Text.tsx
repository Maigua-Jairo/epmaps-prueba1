import { Text as RNText, type TextProps } from 'react-native';

/**
 * Texto de la app con Manrope por defecto. Un `font-*` en className elige el peso:
 * las clases de peso más grueso se generan después y prevalecen sobre font-normal.
 */
export function Text({ className, ...rest }: TextProps) {
  return <RNText className={`font-normal ${className ?? ''}`} {...rest} />;
}
