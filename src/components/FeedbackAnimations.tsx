import LottieView, { type AnimationObject } from 'lottie-react-native';
import type { ViewStyle } from 'react-native';

import cloudSync from '../../assets/animations/Cloud Sync Loading Loop Animation.json';
import loadingDots from '../../assets/animations/Loading Dots.json';
import gpsPin from '../../assets/animations/Location Map Pin.json';
import success from '../../assets/animations/Check Mark - Success.json';

function Animation({
  source,
  style,
  loop = true,
}: {
  source: AnimationObject;
  style: ViewStyle;
  loop?: boolean;
}) {
  return <LottieView source={source} style={style} autoPlay loop={loop} resizeMode="contain" />;
}

export function CargandoMedidorAnimation() {
  return <Animation source={loadingDots} style={{ width: 120, height: 120 }} />;
}

export function ObteniendoUbicacionAnimation({ size = 72 }: { size?: number }) {
  return <Animation source={gpsPin} style={{ width: size, height: size }} />;
}

export function SincronizandoLecturasAnimation({ size = 36 }: { size?: number }) {
  return <Animation source={cloudSync} style={{ width: size, height: size }} />;
}

export function LecturaGuardadaAnimation() {
  return <Animation source={success} style={{ width: 180, height: 180 }} loop={false} />;
}
