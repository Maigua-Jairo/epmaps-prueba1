import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SessionProvider, useSession } from '@/hooks/useSession';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SessionProvider>
  );
}

/** Sin sesión solo existe (auth); con sesión solo (dashboard). Expo Router redirige solo (R1). */
function RootNavigator() {
  const { sesion, cargando } = useSession();

  useEffect(() => {
    if (!cargando) SplashScreen.hideAsync();
  }, [cargando]);

  if (cargando) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={sesion !== null}>
        <Stack.Screen name="(dashboard)" />
      </Stack.Protected>
      <Stack.Protected guard={sesion === null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
