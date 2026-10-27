import { View, type ViewProps } from 'react-native';

export function Card({ className, ...rest }: ViewProps) {
  return (
    <View
      className={`rounded-3xl bg-white p-5 shadow-sm shadow-slate-300 ${className ?? ''}`}
      {...rest}
    />
  );
}
