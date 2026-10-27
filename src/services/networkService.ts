import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

/** Hay conexión real a internet; mientras NetInfo no lo sabe (null) se asume que sí. */
export function estaEnLinea(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export async function hayConexion(): Promise<boolean> {
  return estaEnLinea(await NetInfo.fetch());
}
