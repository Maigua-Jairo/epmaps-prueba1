import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkStatusBar } from '@/components/NetworkStatusBar';
import { DATABASE_NAME, initDatabase } from '@/database/client';
import { NetworkProvider } from '@/hooks/useNetworkStatus';
import { SessionProvider, useSession } from '@/hooks/useSession';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase}>
      <NetworkProvider>
        <SessionProvider>
          <View className="flex-1">
            {/* R9: la barra está sobre el navegador, así aparece en todas las pantallas. */}
            <NetworkStatusBar />
            <SinMargenSuperior>
              <RootNavigator />
            </SinMargenSuperior>
          </View>
        </SessionProvider>
      </NetworkProvider>
    </SQLiteProvider>
  );
}

/** La barra ya ocupa el área de la barra de estado; las pantallas no deben sumarla otra vez. */
function SinMargenSuperior({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>{children}</SafeAreaInsetsContext.Provider>
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
