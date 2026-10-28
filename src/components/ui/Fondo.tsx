import { View, type ViewProps } from 'react-native';

/** Manchas de agua que las tarjetas translúcidas dejan ver: efecto liquid glass sin desenfoque. */
export function Fondo({ className, children, ...rest }: ViewProps) {
  return (
    <View className={`flex-1 overflow-hidden bg-epmaps-bg ${className ?? ''}`} {...rest}>
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -right-24 top-48 h-80 w-80 rounded-full bg-epmaps-accent/15"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -left-32 bottom-16 h-96 w-96 rounded-full bg-epmaps-secondary/10"
      />
      {children}
    </View>
  );
}

export function ReflejosCabecera() {
  return (
    <>
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-epmaps-accent/20"
      />
      <View
        style={{ pointerEvents: 'none' }}
        className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-epmaps-primary/40"
      />
    </>
  );
}
