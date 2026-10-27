import { Directory, File, Paths } from 'expo-file-system';

/**
 * Las fotos de la cámara llegan a la caché, que el sistema puede borrar.
 * Se mueven a Paths.document, que solo se borra al desinstalar la app,
 * para que sobrevivan días y reinicios hasta que la lectura se envíe (R7).
 */
const carpetaFotos = () => new Directory(Paths.document, 'fotos-lecturas');

export async function persistirFoto(uriTemporal: string, codigoMedidor: string): Promise<string> {
  const carpeta = carpetaFotos();
  carpeta.create({ idempotent: true, intermediates: true });
  const foto = new File(uriTemporal);
  const destino = new File(carpeta, `${codigoMedidor}_${Date.now()}.jpg`);
  await foto.move(destino);
  return destino.uri;
}

export function eliminarFoto(uri: string | null): void {
  if (!uri) return;
  const foto = new File(uri);
  if (foto.exists) foto.delete();
}
