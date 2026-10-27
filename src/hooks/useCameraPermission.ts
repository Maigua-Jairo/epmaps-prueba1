import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

/**
 * - sin-preguntar: aún no se ha pedido el permiso.
 * - denegado: se rechazó, pero se puede volver a pedir.
 * - bloqueado: Android ya no muestra el diálogo; solo se activa desde Ajustes.
 */
export type EstadoPermisoCamara = 'cargando' | 'sin-preguntar' | 'concedido' | 'denegado' | 'bloqueado';

/** Permiso de cámara con expo-image-picker (R7). */
export function useCameraPermission() {
  const [permiso, pedirPermiso] = ImagePicker.useCameraPermissions();

  let estado: EstadoPermisoCamara;
  if (!permiso) estado = 'cargando';
  else if (permiso.granted) estado = 'concedido';
  else if (permiso.status === ImagePicker.PermissionStatus.UNDETERMINED) estado = 'sin-preguntar';
  else if (permiso.canAskAgain) estado = 'denegado';
  else estado = 'bloqueado';

  return {
    estado,
    /** Muestra el diálogo del sistema; devuelve true si el técnico lo concede. */
    solicitar: async () => (await pedirPermiso()).granted,
    abrirAjustes: () => Linking.openSettings(),
  };
}
