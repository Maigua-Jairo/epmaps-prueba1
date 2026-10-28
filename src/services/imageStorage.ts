import { Directory, File, Paths } from 'expo-file-system';

/** R7: la cámara deja la foto en caché; se mueve a documentos, que solo se borra al desinstalar. */
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
