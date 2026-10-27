import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/** Hay conexión real a internet; mientras NetInfo no lo sabe (null) se asume que sí. */
export function estaEnLinea(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export async function hayConexion(): Promise<boolean> {
  return estaEnLinea(await NetInfo.fetch());
}

/** Avisa cada cambio de conectividad (R9); se dispara también al suscribirse. */
export function suscribirConexion(onCambio: (enLinea: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => onCambio(estaEnLinea(state)));
}
