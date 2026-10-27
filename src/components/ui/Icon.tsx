import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Íconos de la app (Ionicons). Decorativos por defecto: el texto vecino da el significado. */
export function Icon({
  name,
  size = 20,
  color = '#0F172A',
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
