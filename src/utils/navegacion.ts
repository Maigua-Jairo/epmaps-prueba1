import { router } from 'expo-router';

/** Vuelve a la pantalla anterior; si no hay ninguna (p. ej. se abrió al iniciar la app), va al inicio. */
export function volver(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
